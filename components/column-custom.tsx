import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

// Enum for column types
enum ColumnType {
  Text = "text",
  Button = "button",
  Switch = "switch",
  Currency = "currency",
  Date = "date",
  Gender = "gender",
  Status = "examination_status",
  StatusBed = "status_bed",
  PaymentStatus = "paymentStatus",
  InsuranceApplicable = "insuranceApplicable",
  health_insurance_applied = "health_insurance_applied",
}

// Interface for data type
interface DataType {
  id: string | bigint;
  [key: string]: any;
}

// Interface for action buttons configuration
interface ActionButtonsConfig {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
}

// Function to map the header label
const getHeaderLabel = (key: string, columnHeaderMap: { [key: string]: string }) => {
  return columnHeaderMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

// Function to render cell content based on column type
const renderCellContent = (
  value: any,
  columnType: ColumnType,
  onStatusChange?: (newValue: number) => void
) => {
  switch (columnType) {
    case ColumnType.Text:
      if (Array.isArray(value)) {
        return <div>{value.join(", ")}</div>; // Định dạng mảng với dấu phẩy
      }
      return <div>{value}</div>;

    case ColumnType.Currency:
      return (
        <div className="text-right font-medium w-fit">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)}
        </div>
      );

    case ColumnType.Switch:
      return (
        <Switch
          checked={value === 1}
          onCheckedChange={(newValue) => onStatusChange?.(newValue ? 1 : 0)}
        />
      );

    case ColumnType.Button:
      return (
        <Button onClick={() => alert(`Button clicked: ${value}`)} variant="ghost">
          {value}
        </Button>
      );

    case ColumnType.Date:
      return (
        <div>
          {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value))}
        </div>
      );

    case ColumnType.Gender:
      return <div>{value === 1 ? "Nam" : "Nữ"}</div>;

    case ColumnType.Status:
      return <div>{value === 1 ? "Đã khám" : value === 0 ? "Chưa khám" : "Đang khám"}</div>;

    case ColumnType.PaymentStatus:
      return <div>{value === 1 ? "Đủ" : "Còn thiếu"}</div>;

    case ColumnType.InsuranceApplicable:
      return <div>{value === 1 ? "Có" : "Không"}</div>;
    case ColumnType.health_insurance_applied:
      return <div>{value === 1 ? "Có" : "Không"}</div>;
    case ColumnType.StatusBed:
      return <div>{value === 1 ? "Đã đầy" : "Chưa đầy"}</div>;

    default:
      return <div>{value}</div>;
  }
};



const createColumns = <T extends DataType>(
  data: T[],
  onView?: (id: string | bigint) => void,
  onEdit?: (id: string | bigint) => void,
  onDelete?: (id: string | bigint) => void,
  columnHeaderMap: { [key: string]: string } = {},
  actionButtonsConfig: ActionButtonsConfig = {},
  switchConfig: { key: string; onStatusChange: (id: string | bigint, newValue: number) => void }[] = [],
  buttonColumnConfig?: {
    id: string;
    header: string;
    onClickConfig: (id: string | bigint) => void;
    content: string;
  },
): ColumnDef<T>[] => {
  const columns: ColumnDef<T>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data available to create columns.");
    return [];
  }

  const keys = Object.keys(data[0]).filter((key) => !key.includes("id") && !key.includes("detail") && !key.includes("level"));

  keys.forEach((key) => {
    // Kiểm tra nếu key không tồn tại trong columnHeaderMap thì không thêm cột
    if (!columnHeaderMap[key]) {
      return;
    }

    let columnType: ColumnType = ColumnType.Text;

    if (key === "room_codes") {
      columnType = ColumnType.Text; // Đảm bảo sử dụng kiểu Text để xử lý trong renderCellContent
    }

    const switchColumn = switchConfig.find((config) => config.key === key);
    if (switchColumn) {
      columnType = ColumnType.Switch;
    } else if (key === "amount") {
      columnType = ColumnType.Currency;
    } else if (key === "buttonLabel") {
      columnType = ColumnType.Button;
    } else if (key.toLowerCase().includes("date") || key === "created_at" || key === "updated_at") {
      columnType = ColumnType.Date;
    } else if (key === "gender") {
      columnType = ColumnType.Gender;
    } else if (key === "examination_status") {
      columnType = ColumnType.Status;
    } else if (key === "paymentStatus") {
      columnType = ColumnType.PaymentStatus;
    } else if (key === "insuranceApplicable") {
      columnType = ColumnType.InsuranceApplicable;
    } else if (key === "health_insurance_applied") {
      columnType = ColumnType.health_insurance_applied;
    } else if (key === "status_bed") {
      columnType = ColumnType.StatusBed;
    }

    columns.push({
      accessorKey: key,
      header: getHeaderLabel(key, columnHeaderMap),
      cell: ({ row }) =>
        renderCellContent(
          row.getValue(key),
          columnType,
          switchColumn ? (newValue) => switchColumn.onStatusChange(row.original.id, newValue ? 1 : 0) : undefined
        ),
    });
  });

  // Add payment confirmation column if needed
  if (buttonColumnConfig) {
    columns.push({
      id: buttonColumnConfig.id,
      header: buttonColumnConfig.header,
      cell: ({ row }) => (
        <Button 
          onClick={() => buttonColumnConfig.onClickConfig(row.original.id)} // Truyền toàn bộ đối tượng
          variant="outline" 
          size="sm"
        >
          {buttonColumnConfig.content}
        </Button>
      ),
    });
  }

  // Add action buttons column if any action is configured
  if (actionButtonsConfig.view || actionButtonsConfig.edit || actionButtonsConfig.delete) {
    columns.push({
      id: "actions",
      header: () => <div className="text-center">Hành động</div>,
      cell: ({ row }) => (
        <div className="space-x-2 w-fit flex justify-center items-center mx-auto">
          {actionButtonsConfig.view && onView && (
            <Button
              onClick={() => onView(row.original.id)}
              variant="ghost"
              className="p-1 m-0 w-6 h-6 flex justify-center items-center"
            >
              <FaEye size={12} />
            </Button>
          )}
          {actionButtonsConfig.edit && onEdit && (
            <Button
              onClick={() => onEdit(row.original.id)}
              variant="ghost"
              className="p-1 m-0 w-6 h-6 flex justify-center items-center"
            >
              <FaEdit size={12} />
            </Button>
          )}
          {actionButtonsConfig.delete && onDelete && (
            <Button
              onClick={() => onDelete(row.original.id)}
              variant="ghost"
              className="p-1 m-0 w-6 h-6 flex justify-center items-center"
            >
              <FaTrash size={12} />
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
    });
  }

  return columns;
};
export default createColumns;

