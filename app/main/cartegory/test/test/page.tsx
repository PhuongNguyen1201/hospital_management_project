"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

type Field = {
  name: string;
  value: string;
};

type Attribute = {
  name: string;
  fields: Field[];
};

const YourComponent = () => {
  const [attributeName, setAttributeName] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [error, setError] = useState("");
  const [selectedAttributeIndex, setSelectedAttributeIndex] = useState<number | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingFieldName, setEditingFieldName] = useState("");
  const [editingFieldValue, setEditingFieldValue] = useState("");
  const [editingAttributeName, setEditingAttributeName] = useState("");

  // Trạng thái dialog
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [isEditAttributeOpen, setIsEditAttributeOpen] = useState(false);

  // Save attribute
  const handleSaveAttribute = () => {
    if (!attributeName) {
      setError("Vui lòng điền.");
      return;
    }
    setError("");
    const newAttribute: Attribute = {
      name: attributeName,
      fields: [],
    };
    setAttributes([...attributes, newAttribute]);
    setAttributeName("");
  };

  // Handle add field
  const handleAddField = (index: number) => {
    if (!fieldName || !fieldValue) {
      setError("Yêu cầu điền.");
      return;
    }
    const newField: Field = { name: fieldName, value: fieldValue };
    const newAttributes = [...attributes];
    newAttributes[index].fields.push(newField);
    setAttributes(newAttributes);
    setFieldName("");
    setFieldValue("");
    setIsAddFieldOpen(false); // Đóng dialog AddField sau khi thêm trường
  };

  // Handle open edit field dialog
  const handleOpenEditFieldDialog = (attrIndex: number, fieldIndex: number) => {
    setSelectedAttributeIndex(attrIndex);
    const field = attributes[attrIndex].fields[fieldIndex];
    setEditingFieldName(field.name);
    setEditingFieldValue(field.value);
    setEditingFieldIndex(fieldIndex);
    setIsAddFieldOpen(false); // Đóng dialog AddField khi mở EditField
    setIsEditFieldOpen(true);
  };

  // Handle save edit field
  const handleSaveEditField = () => {
    if (selectedAttributeIndex !== null && editingFieldIndex !== null) {
      const newAttributes = [...attributes];
      const field = newAttributes[selectedAttributeIndex].fields[editingFieldIndex];
      field.name = editingFieldName;
      field.value = editingFieldValue;
      setAttributes(newAttributes);
      setEditingFieldName("");
      setEditingFieldValue("");
      setEditingFieldIndex(null);
      setSelectedAttributeIndex(null);
      setIsEditFieldOpen(false); // Đóng dialog EditField sau khi lưu
    }
  };

  // Handle delete field
  const handleDeleteField = (attrIndex: number, fieldIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].fields.splice(fieldIndex, 1);
    setAttributes(newAttributes);
  };

  // Handle open edit attribute dialog
  const handleOpenEditAttributeDialog = (attrIndex: number) => {
    const attribute = attributes[attrIndex];
    setEditingAttributeName(attribute.name);
    setSelectedAttributeIndex(attrIndex);
    setIsAddFieldOpen(false); // Đóng dialog AddField khi mở EditAttribute
    setIsEditAttributeOpen(true);
  };

  // Handle save edit attribute
  const handleSaveEditAttribute = () => {
    if (selectedAttributeIndex !== null) {
      const newAttributes = [...attributes];
      newAttributes[selectedAttributeIndex].name = editingAttributeName;
      setAttributes(newAttributes);
      setEditingAttributeName("");
      setSelectedAttributeIndex(null);
      setIsEditAttributeOpen(false); // Đóng dialog EditAttribute sau khi lưu
    }
  };

  return (
    <div className="w-[600px] mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6">Thông tin mẫu dịch vụ</h3>

      {/* Enter attribute name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Thuộc tính</label>
        <input
          className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Nhập thuộc tính"
          value={attributeName}
          onChange={(e) => setAttributeName(e.target.value)}
        />
      </div>

      {/* Show error message if fields are missing */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Save attribute button */}
      <Button
        onClick={handleSaveAttribute}
      >
        Thêm
      </Button>

      {/* Display attribute list */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold">Thông tin chi tiết:</h4>
        <ul className="space-y-4 mt-4">
          {attributes.map((attribute, attrIndex) => (
            <li key={attrIndex} className="border p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">{attribute.name}</span>
                <div className="flex gap-2">
                  {/* Edit attribute button */}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditAttributeDialog(attrIndex)}
                  >
                    Sửa thuộc tính
                  </Button>

                  {/* Delete attribute */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAttributes = attributes.filter((_, i) => i !== attrIndex);
                      setAttributes(newAttributes);
                    }}
                  >
                    Xóa thuộc tính
                  </Button>

                  {/* Add field button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAttributeIndex(attrIndex);
                      setIsAddFieldOpen(true);
                    }}
                  >
                    Thêm trường
                  </Button>
                </div>
              </div>

              {/* Fields list */}
              <ul className="mt-4">
                {attribute.fields.map((field, fieldIndex) => (
                  <li key={fieldIndex} className="flex justify-between items-center mb-2">
                    <div>
                      <strong>{field.name}:</strong> {field.value}
                    </div>
                    <div className="space-x-2">
                      {/* Edit Field */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditFieldDialog(attrIndex, fieldIndex)}
                      >
                        Edit
                      </Button>
                      {/* Delete Field */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteField(attrIndex, fieldIndex)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Attribute Dialog */}
      <Dialog open={isEditAttributeOpen} onOpenChange={setIsEditAttributeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Attribute</DialogTitle>
            <DialogDescription>Update the name of the attribute.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editingAttributeName" className="text-right">
                Attribute Name
              </Label>
              <Input
                id="editingAttributeName"
                value={editingAttributeName}
                onChange={(e) => setEditingAttributeName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEditAttribute}>Save Changes</Button>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsEditAttributeOpen(false)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Field</DialogTitle>
            <DialogDescription>Add a new field to this attribute.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldName" className="text-right">
                Field Name
              </Label>
              <Input
                id="fieldName"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldValue" className="text-right">
                Field Value
              </Label>
              <Input
                id="fieldValue"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleAddField(selectedAttributeIndex!)}>Add Field</Button>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsAddFieldOpen(false)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={isEditFieldOpen} onOpenChange={setIsEditFieldOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Edit the name and value of the field.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editingFieldName" className="text-right">
                Field Name
              </Label>
              <Input
                id="editingFieldName"
                value={editingFieldName}
                onChange={(e) => setEditingFieldName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editingFieldValue" className="text-right">
                Field Value
              </Label>
              <Input
                id="editingFieldValue"
                value={editingFieldValue}
                onChange={(e) => setEditingFieldValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEditField}>Save Changes</Button>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsEditFieldOpen(false)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YourComponent;
