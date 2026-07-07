import { vi, describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StatusToggleCard } from "@/components/modules/assets/configuration/master-data/asset-room-type-master/StatusToggleCard";

describe("StatusToggleCard", () => {
  test("renders label and toggle status correctly", () => {
    const handleToggleStatus = vi.fn();
    const statusToggleRef = React.createRef<HTMLButtonElement>();

    render(
      <StatusToggleCard
        statusToggleRef={statusToggleRef}
        isActive={true}
        handleToggleStatus={handleToggleStatus}
        statusLabel="Status"
        statusDescription="Set active status"
        activeText="Active"
        inactiveText="Inactive"
        errorMessage=""
      />
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Set active status Active")).toBeInTheDocument();
  });
});
