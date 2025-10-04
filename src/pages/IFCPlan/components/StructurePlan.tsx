import React, { useState } from "react";
import * as FRAG from "@thatopen/fragments";

import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  Box,
} from "lucide-react";

interface StructurePlanProps {
  data: FRAG.SpatialTreeItem;
  toggleVisible: (localId: number) => void;
  className?: string;
}

interface TreeItemProps {
  item: FRAG.SpatialTreeItem;
  toggleVisible: (localId: number) => void;
  level: number;
  visibleItems: Set<number>;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  itemKey: string;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  toggleVisible,
  level,
  visibleItems,
  expandedItems,
  onToggleExpanded,
  itemKey,
}) => {
  const hasChildren = !!item.children?.length;
  const isExpanded = expandedItems.has(itemKey);

  const isVisible =
    item.localId !== null ? visibleItems.has(item.localId) : true;

  // ✅ Label fallback: category > localId > "Unnamed Item"
  const label =
    item.category ??
    (item.localId !== null ? `Item ${item.localId}` : "Unnamed Item");

  const handleExpandToggle = () => {
    if (hasChildren) onToggleExpanded(itemKey);
  };

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.localId !== null) toggleVisible(item.localId);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 group ${
          !isVisible ? "opacity-60" : ""
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleExpandToggle}
      >
        {/* Expand/Collapse Button */}
        <div className="flex items-center justify-center w-5 h-5 mr-2">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Item Icon */}
        <div className="flex items-center justify-center w-5 h-5 mr-3">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )
          ) : (
            <Box className="w-4 h-4 text-gray-500" />
          )}
        </div>

        {/* Item Label */}
        <div className="flex items-center justify-between flex-1">
          <span
            className={`text-sm font-medium ${
              hasChildren ? "text-gray-800" : "text-gray-600"
            }`}
          >
            {label}
          </span>

          {/* Visibility Toggle - only if localId exists */}
          {item.localId !== null && (
            <button
              onClick={handleVisibilityToggle}
              className="p-1 transition-all duration-200 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200"
              title={isVisible ? "Hide item" : "Show item"}
            >
              {isVisible ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-0">
          {item.children!.map((child, index) => {
            // ✅ Key is stable: include itemKey path + child.localId (if exists)
            const childKey = `${itemKey}-${child.localId ?? index}`;
            return (
              <TreeItem
                key={childKey}
                item={child}
                toggleVisible={toggleVisible}
                level={level + 1}
                visibleItems={visibleItems}
                expandedItems={expandedItems}
                onToggleExpanded={onToggleExpanded}
                itemKey={childKey}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const StructurePlan: React.FC<StructurePlanProps> = ({
  data,
  toggleVisible,
  className = "",
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [visibleItems, setVisibleItems] = useState<Set<number>>(() => {
    // Collect all localIds (ignore nulls)
    const collectIds = (item: FRAG.SpatialTreeItem): number[] => {
      const ids: number[] = [];
      if (item.localId !== null) ids.push(item.localId);
      if (item.children) {
        item.children.forEach((child) => ids.push(...collectIds(child)));
      }
      return ids;
    };
    return new Set(collectIds(data));
  });

  const handleToggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(itemKey) ? newSet.delete(itemKey) : newSet.add(itemKey);
      return newSet;
    });
  };

  const handleToggleVisible = (localId: number) => {
    setVisibleItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(localId) ? newSet.delete(localId) : newSet.add(localId);
      return newSet;
    });
    toggleVisible(localId);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="flex items-center text-lg font-semibold text-gray-800">
          <Folder className="w-5 h-5 mr-2 text-blue-600" />
          Structure Plan
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Navigate and manage your spatial structure
        </p>
      </div>

      {/* Tree Content */}
      <div className="p-4 overflow-y-auto max-h-96">
        <TreeItem
          item={data}
          toggleVisible={handleToggleVisible}
          level={0}
          visibleItems={visibleItems}
          expandedItems={expandedItems}
          onToggleExpanded={handleToggleExpanded}
          itemKey="root"
        />
      </div>
    </div>
  );
};

// // Demo Component with Sample Data
// const StructurePlanDemo = () => {
//   const sampleData: FRAG.SpatialTreeItem = {
//     category: "Main Building",
//     localId: 1,
//     children: [
//       {
//         category: "Ground Floor",
//         localId: 2,
//         children: [
//           { category: "Lobby", localId: 3 },
//           { category: "Reception", localId: 4 },
//           {
//             category: "Conference Room",
//             localId: 5,
//             children: [
//               { category: "Main Table", localId: 6 },
//               { category: "Projector", localId: 7 }
//             ]
//           }
//         ]
//       },
//       {
//         category: "Second Floor",
//         localId: 8,
//         children: [
//           { category: "Office 201", localId: 9 },
//           { category: "Office 202", localId: 10 },
//           {
//             category: "Break Room",
//             localId: 11,
//             children: [
//               { category: "Kitchen Area", localId: 12 },
//               { category: "Seating Area", localId: 13 }
//             ]
//           }
//         ]
//       },
//       {
//         category: "Third Floor",
//         localId: 14,
//         children: [
//           { category: "Server Room", localId: 15 },
//           { category: "Storage", localId: 16 }
//         ]
//       }
//     ]
//   };

//   const handleToggleVisible = (localId: number) => {
//     console.log(`Toggling visibility for item with localId: ${localId}`);
//   };

//   return (
//     <div className="min-h-screen p-8 bg-gray-50">
//       <div className="max-w-md mx-auto">
//         <StructurePlan
//           data={sampleData}
//           toggleVisible={handleToggleVisible}
//         />
//       </div>
//     </div>
//   );
// };

// export default StructurePlanDemo;
