import React from "react";
import { BusinessFilter } from "../components/BusinessFilter";

const TestPage: React.FC = () => {
  const handleFilterChange = (filterValues: {
    taskIds: string[];
    beginTime?: string;
    endTime?: string;
  }) => {
    console.log("Filter values:", filterValues);
  };

  const handleReset = () => {
    console.log("Reset filters");
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>测试时间选择器中文化</h1>
      <BusinessFilter 
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    </div>
  );
};

export default TestPage;