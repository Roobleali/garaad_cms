import React, { useState } from 'react';
import { TableFeature, TableGrid } from '@/types/learning';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface TableContentEditorProps {
    type: 'table' | 'table-grid';
    features?: TableFeature[];
    table?: TableGrid;
    onChange: (data: { features?: TableFeature[]; table?: TableGrid }) => void;
}

const TableContentEditor: React.FC<TableContentEditorProps> = ({
    type,
    features = [],
    table = { header: [], rows: [] },
    onChange,
}) => {
    const [localFeatures, setLocalFeatures] = useState<TableFeature[]>(features);
    const [localTable, setLocalTable] = useState<TableGrid>(table);

    const handleFeatureChange = (index: number, field: keyof TableFeature, value: string) => {
        const newFeatures = [...localFeatures];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setLocalFeatures(newFeatures);
        onChange({ features: newFeatures });
    };

    const addFeature = () => {
        const newFeatures = [...localFeatures, { title: '', text: '' }];
        setLocalFeatures(newFeatures);
        onChange({ features: newFeatures });
    };

    const removeFeature = (index: number) => {
        const newFeatures = localFeatures.filter((_, i) => i !== index);
        setLocalFeatures(newFeatures);
        onChange({ features: newFeatures });
    };

    const handleTableHeaderChange = (index: number, value: string) => {
        const newHeader = [...localTable.header];
        newHeader[index] = value;
        setLocalTable({ ...localTable, header: newHeader });
        onChange({ table: { ...localTable, header: newHeader } });
    };

    const handleTableCellChange = (rowIndex: number, cellIndex: number, value: string) => {
        const newRows = [...localTable.rows];
        if (!newRows[rowIndex]) {
            newRows[rowIndex] = new Array(localTable.header.length).fill('');
        }
        newRows[rowIndex][cellIndex] = value;
        setLocalTable({ ...localTable, rows: newRows });
        onChange({ table: { ...localTable, rows: newRows } });
    };

    const addTableRow = () => {
        const newRows = [...localTable.rows, new Array(localTable.header.length).fill('')];
        setLocalTable({ ...localTable, rows: newRows });
        onChange({ table: { ...localTable, rows: newRows } });
    };

    const removeTableRow = (rowIndex: number) => {
        const newRows = localTable.rows.filter((_, i) => i !== rowIndex);
        setLocalTable({ ...localTable, rows: newRows });
        onChange({ table: { ...localTable, rows: newRows } });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{type === 'table' ? 'Feature Table' : 'Grid Table'}</CardTitle>
            </CardHeader>
            <CardContent>
                {type === 'table' ? (
                    <div className="space-y-4">
                        {localFeatures.map((feature, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="Title"
                                        value={feature.title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleFeatureChange(index, 'title', e.target.value)
                                        }
                                    />
                                    <Input
                                        placeholder="Text"
                                        value={feature.text}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleFeatureChange(index, 'text', e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeFeature(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addFeature} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Feature
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                            {localTable.header.map((header, index) => (
                                <Input
                                    key={index}
                                    placeholder={`Header ${index + 1}`}
                                    value={header}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleTableHeaderChange(index, e.target.value)
                                    }
                                />
                            ))}
                        </div>
                        {localTable.rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-4 items-center">
                                {row.map((cell, cellIndex) => (
                                    <Input
                                        key={cellIndex}
                                        placeholder={`Cell ${rowIndex + 1}-${cellIndex + 1}`}
                                        value={cell}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleTableCellChange(rowIndex, cellIndex, e.target.value)
                                        }
                                    />
                                ))}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeTableRow(rowIndex)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addTableRow} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Row
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TableContentEditor; 