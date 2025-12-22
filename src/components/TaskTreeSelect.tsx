import React, { useState, useEffect } from 'react';
import { TreeSelect, Spin, message } from 'antd';
import type { TreeSelectProps } from 'antd/es/tree-select';
import thirdservice from '../services/thirdService';

interface TreeNode {
  id: string | number;
  title: string;
  name?: string;
  value?: string | number;
  children?: TreeNode[];
  [key: string]: any; // 允许其他属性
}

interface TaskTreeSelectProps extends TreeSelectProps<string | number | (string | number)[]> {
  onlyRootNode?: boolean; // 是否只允许选择根节点
  useNonCycleApi?: boolean; // 是否使用非周期接口
}

const TaskTreeSelect: React.FC<TaskTreeSelectProps> = ({
  onlyRootNode = true,
  useNonCycleApi = false,
  ...selectProps
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取任务树数据
  const fetchTaskTree = async () => {
    setLoading(true);
    try {
      const res = await thirdservice.taskTree(useNonCycleApi);
      if (res.code === 200) {
        // 转换数据结构以适配TreeSelect组件
        const convertedData = convertTreeNodeStructure(res.data || []);
        setTreeData(convertedData);
      } else {
        message.error(res.message || '获取任务树失败');
      }
    } catch (error) {
      message.error('获取任务树失败');
      console.error('获取任务树失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 转换树节点结构以适配TreeSelect组件
  const convertTreeNodeStructure = (nodes: any[]): TreeNode[] => {
    if (!Array.isArray(nodes)) return [];

    return nodes.map(node => {
      // 确保节点有title和value字段
      const title = node.title || node.name || `任务-${node.id}`;
      const value = node.value !== undefined ? node.value : node.id;
      
      const convertedNode: TreeNode = {
        ...node,
        title,
        value,
      };

      // 递归转换子节点
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        convertedNode.children = convertTreeNodeStructure(node.children);
      }

      return convertedNode;
    });
  };

  // 设置节点是否可选择
  const setNodeSelectable = (nodes: TreeNode[], isRoot = true): TreeNode[] => {
    if (!nodes || nodes.length === 0) return [];

    return nodes.map(node => {
      const modifiedNode: TreeNode = {
        ...node,
        // 如果只允许选择根节点，则非根节点设置为不可选择
        selectable: !(onlyRootNode && !isRoot)
      };

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        modifiedNode.children = setNodeSelectable(node.children, false);
      }

      return modifiedNode;
    });
  };

  // 根据搜索关键词过滤选项
  const filterTreeNode = (inputValue: string, treeNode: any) => {
    if (!treeNode.title) return false;
    return treeNode.title.toString().toLowerCase().includes(inputValue.toLowerCase());
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTaskTree();
  }, []);

  // 处理后的树数据
  const processedTreeData = setNodeSelectable(treeData);

  return (
    <TreeSelect
      showSearch
      placeholder="请选择任务"
      treeData={processedTreeData}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : null}
      filterTreeNode={filterTreeNode}
      {...selectProps}
    />
  );
};

export default TaskTreeSelect;