// 部门树构建工具
export interface DeptNode {
  deptCode: string;
  deptName: string;
  parentCode: string;
  deptLevel?: number; // 部门层级，第一层是1，第二层是2，依次类推
  children?: DeptNode[];
}

/**
 * 将部门数组构建成树形结构
 * @param deptArray 部门数组
 * @returns 部门树形结构
 */
export function buildDeptTree(deptArray: DeptNode[]): DeptNode[] {
  // 创建一个映射，方便快速查找节点
  const nodeMap: Record<string, DeptNode> = {};
  const roots: DeptNode[] = [];

  // 初始化所有节点
  deptArray.forEach(dept => {
    nodeMap[dept.deptCode] = { ...dept, children: [] };
  });

  // 构建树形结构
  deptArray.forEach(dept => {
    const node = nodeMap[dept.deptCode];
    if (!dept.parentCode || dept.parentCode === "") {
      // 没有父节点，则作为根节点
      node.deptLevel = 1; // 根节点层级为1
      roots.push(node);
    } else {
      // 有父节点，则添加到父节点的children中
      const parent = nodeMap[dept.parentCode];
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
        // 设置节点层级为父节点层级+1
        node.deptLevel = (parent.deptLevel || 0) + 1;
      } else {
        // 父节点不存在，但parentCode不为空，这种情况可能是中间层级缺失
        // 我们仍然将其作为根节点处理，但需要特殊标记
        node.deptLevel = 1; // 根节点层级为1
        roots.push(node);
      }
    }
  });

  // 重新计算层级，确保层级关系正确
  const recalculateLevels = (nodes: DeptNode[], level: number) => {
    nodes.forEach(node => {
      node.deptLevel = level;
      if (node.children && node.children.length > 0) {
        recalculateLevels(node.children, level + 1);
      }
    });
  };

  recalculateLevels(roots, 1);

  return roots;
}

/**
 * 根据部门代码查找部门节点
 * @param tree 部门树
 * @param deptCode 部门代码
 * @returns 部门节点
 */
export function findDeptNode(tree: DeptNode[], deptCode: string): DeptNode | null {
  for (const node of tree) {
    if (node.deptCode === deptCode) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findDeptNode(node.children, deptCode);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 获取部门的所有子部门（包括子部门的子部门）
 * @param node 部门节点
 * @returns 所有子部门代码数组
 */
export function getAllChildDeptCodes(node: DeptNode): string[] {
  const codes: string[] = [];
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      codes.push(child.deptCode);
      codes.push(...getAllChildDeptCodes(child));
    });
  }
  
  return codes;
}

/**
 * 扁平化部门树为数组
 * @param tree 部门树
 * @returns 扁平化的部门数组
 */
export function flattenDeptTree(tree: DeptNode[]): DeptNode[] {
  const result: DeptNode[] = [];
  
  function traverse(nodes: DeptNode[]) {
    nodes.forEach(node => {
      result.push({ ...node, children: undefined });
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  
  traverse(tree);
  return result;
}

/**
 * 过滤出指定层级的部门节点
 * @param tree 部门树
 * @param level 指定层级
 * @returns 指定层级的部门节点数组
 */
export function filterDeptByLevel(tree: DeptNode[], level: number): DeptNode[] {
  const result: DeptNode[] = [];
  
  function traverse(nodes: DeptNode[]) {
    nodes.forEach(node => {
      if (node.deptLevel === level) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  
  traverse(tree);
  return result;
}

/**
 * 调试方法：打印部门树结构
 * @param tree 部门树
 * @param prefix 前缀字符串
 */
export function printDeptTree(tree: DeptNode[], prefix: string = ""): string {
  let result = "";
  
  tree.forEach((node, index) => {
    const isLast = index === tree.length - 1;
    const connector = isLast ? "└── " : "├── ";
    result += `${prefix}${connector}${node.deptName} (${node.deptCode}, Level: ${node.deptLevel})\n`;
    
    if (node.children && node.children.length > 0) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += printDeptTree(node.children, newPrefix);
    }
  });
  
  return result;
}