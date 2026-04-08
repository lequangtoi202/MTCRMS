import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUnitDto } from '../dto/create-unit.dto';
import { ListUnitsDto } from '../dto/list-units.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { UnitEntity, UnitLevel } from '../entities/unit.entity';
import { UnitRepository } from '../repositories/unit.repository';

export interface UnitTreeNode {
  id: string;
  code: string;
  name: string;
  level: number;
  parentId: string | null;
  headcount: number;
  totalHeadcount: number;
  sortOrder: number;
  description: string | null;
  isActive: boolean;
  directChildrenCount: number;
  descendantCount: number;
  children: UnitTreeNode[];
}

@Injectable()
export class UnitsService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async create(payload: CreateUnitDto) {
    await this.ensureCodeIsUnique(payload.code);

    const parent = payload.parentId
      ? await this.getUnitOrFail(payload.parentId)
      : null;

    this.validateLevelAndParent(payload.level, parent);

    const unit = new UnitEntity();
    unit.code = payload.code.trim().toUpperCase();
    unit.name = payload.name.trim();
    unit.level = payload.level as UnitLevel;
    unit.parentId = parent?.id ?? null;
    unit.parent = parent;
    unit.headcount = payload.headcount ?? 0;
    unit.sortOrder = payload.sortOrder ?? 0;
    unit.description = payload.description?.trim() ?? null;
    unit.isActive = payload.isActive ?? true;

    return {
      message: 'Unit created successfully',
      data: this.toUnitDetail(await this.unitRepository.save(unit)),
    };
  }

  async findAll(query: ListUnitsDto) {
    const allUnits = await this.unitRepository.findAll();
    const includeInactive = query.includeInactive === 'true';
    const filteredUnits = allUnits.filter((unit) => {
      if (!includeInactive && !unit.isActive) {
        return false;
      }

      if (query.parentId) {
        return unit.parentId === query.parentId;
      }

      return true;
    });

    return {
      message: 'Units retrieved successfully',
      data: filteredUnits.map((unit) => this.toUnitSummary(unit)),
    };
  }

  async findOne(id: string) {
    const targetUnit = await this.getUnitOrFail(id);
    const allUnits = await this.unitRepository.findAll();
    const treeMap = this.buildTreeMap(allUnits);
    const unitNode = treeMap.get(targetUnit.id);

    return {
      message: 'Unit retrieved successfully',
      data: {
        ...this.toUnitDetail(targetUnit),
        stats: unitNode
          ? {
              totalHeadcount: unitNode.totalHeadcount,
              directChildrenCount: unitNode.directChildrenCount,
              descendantCount: unitNode.descendantCount,
            }
          : {
              totalHeadcount: targetUnit.headcount,
              directChildrenCount: 0,
              descendantCount: 0,
            },
      },
    };
  }

  async getTree(includeInactive = false) {
    const allUnits = await this.unitRepository.findAll();
    const filteredUnits = allUnits.filter((unit) =>
      includeInactive ? true : unit.isActive,
    );
    const roots = this.buildForest(filteredUnits);

    return {
      message: 'Unit tree retrieved successfully',
      data: roots,
    };
  }

  async update(id: string, payload: UpdateUnitDto) {
    const unit = await this.getUnitOrFail(id);
    const allUnits = await this.unitRepository.findAll();

    if (payload.code && payload.code.trim().toUpperCase() !== unit.code) {
      await this.ensureCodeIsUnique(payload.code, unit.id);
      unit.code = payload.code.trim().toUpperCase();
    }

    if (payload.name) {
      unit.name = payload.name.trim();
    }

    if (typeof payload.headcount === 'number') {
      unit.headcount = payload.headcount;
    }

    if (typeof payload.sortOrder === 'number') {
      unit.sortOrder = payload.sortOrder;
    }

    if (typeof payload.description === 'string') {
      unit.description = payload.description.trim();
    }

    if (typeof payload.isActive === 'boolean') {
      unit.isActive = payload.isActive;
    }

    const nextLevel = payload.level ?? unit.level;
    const nextParentId =
      payload.parentId === undefined ? unit.parentId : payload.parentId ?? null;
    const parent = nextParentId ? await this.getUnitOrFail(nextParentId) : null;

    this.validateLevelAndParent(nextLevel, parent);
    this.validateNoCycle(unit.id, nextParentId, allUnits);

    unit.level = nextLevel as UnitLevel;
    unit.parentId = parent?.id ?? null;
    unit.parent = parent;

    return {
      message: 'Unit updated successfully',
      data: this.toUnitDetail(await this.unitRepository.save(unit)),
    };
  }

  async remove(id: string) {
    const unit = await this.getUnitOrFail(id);

    if (unit.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete a unit that still has child units',
      );
    }

    await this.unitRepository.remove(unit);

    return {
      message: 'Unit deleted successfully',
      data: null,
    };
  }

  private async getUnitOrFail(id: string): Promise<UnitEntity> {
    const unit = await this.unitRepository.findById(id);

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  private async ensureCodeIsUnique(
    code: string,
    currentUnitId?: string,
  ): Promise<void> {
    const existingUnit = await this.unitRepository.findByCode(
      code.trim().toUpperCase(),
    );

    if (existingUnit && existingUnit.id !== currentUnitId) {
      throw new ConflictException('Unit code already exists');
    }
  }

  private validateLevelAndParent(
    level: number,
    parent: UnitEntity | null,
  ): void {
    if (level < 1 || level > 6) {
      throw new BadRequestException('Unit level must be between 1 and 6');
    }

    if (level === 1 && parent) {
      throw new BadRequestException('Level 1 unit cannot have a parent');
    }

    if (level > 1 && !parent) {
      throw new BadRequestException('Only level 1 units can be root units');
    }

    if (parent && parent.level !== level - 1) {
      throw new BadRequestException(
        'Parent unit must be exactly one level above the child unit',
      );
    }
  }

  private validateNoCycle(
    unitId: string,
    nextParentId: string | null,
    allUnits: UnitEntity[],
  ): void {
    if (!nextParentId) {
      return;
    }

    if (unitId === nextParentId) {
      throw new BadRequestException('Unit cannot be its own parent');
    }

    const parentMap = new Map(allUnits.map((unit) => [unit.id, unit.parentId]));
    let cursor: string | null = nextParentId;

    while (cursor) {
      if (cursor === unitId) {
        throw new BadRequestException(
          'Unit parent chain cannot create a circular relationship',
        );
      }

      cursor = parentMap.get(cursor) ?? null;
    }
  }

  private buildForest(units: UnitEntity[]): UnitTreeNode[] {
    const nodeMap = this.buildTreeMap(units);

    return Array.from(nodeMap.values())
      .filter((node) => !node.parentId)
      .sort(this.compareTreeNodes);
  }

  private buildTreeMap(units: UnitEntity[]): Map<string, UnitTreeNode> {
    const nodeMap = new Map<string, UnitTreeNode>();

    for (const unit of units) {
      nodeMap.set(unit.id, {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        level: unit.level,
        parentId: unit.parentId,
        headcount: unit.headcount,
        totalHeadcount: unit.headcount,
        sortOrder: unit.sortOrder,
        description: unit.description,
        isActive: unit.isActive,
        directChildrenCount: 0,
        descendantCount: 0,
        children: [],
      });
    }

    for (const node of nodeMap.values()) {
      if (!node.parentId) {
        continue;
      }

      const parent = nodeMap.get(node.parentId);

      if (!parent) {
        continue;
      }

      parent.children.push(node);
    }

    const roots = Array.from(nodeMap.values()).filter((node) => !node.parentId);
    roots.sort(this.compareTreeNodes);
    roots.forEach((root) => this.calculateTreeStats(root));

    return nodeMap;
  }

  private calculateTreeStats(node: UnitTreeNode): UnitTreeNode {
    node.children.sort(this.compareTreeNodes);
    node.directChildrenCount = node.children.length;
    node.descendantCount = 0;
    node.totalHeadcount = node.headcount;

    for (const child of node.children) {
      const childNode = this.calculateTreeStats(child);
      node.totalHeadcount += childNode.totalHeadcount;
      node.descendantCount += childNode.descendantCount + 1;
    }

    return node;
  }

  private compareTreeNodes(a: UnitTreeNode, b: UnitTreeNode): number {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.name.localeCompare(b.name);
  }

  private toUnitSummary(unit: UnitEntity) {
    return {
      id: unit.id,
      code: unit.code,
      name: unit.name,
      level: unit.level,
      parentId: unit.parentId,
      headcount: unit.headcount,
      sortOrder: unit.sortOrder,
      isActive: unit.isActive,
    };
  }

  private toUnitDetail(unit: UnitEntity) {
    return {
      ...this.toUnitSummary(unit),
      description: unit.description,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }
}
