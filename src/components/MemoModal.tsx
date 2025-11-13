import React, { useState, useEffect } from "react";

interface MwmoModalProps {
    isOpen:boolean;
    initialMemo?: string;
    onClose: () => void;
    onSave: (memo:string) => void;
}

const MemoModal: React.FC<MwmoModalProps> = ({
    isOpen,
    initialMemo = "",
    onClose,
    onSave,
}) => {
    const [memo, setMemo] = useState(initialMemo);

    useEffect(() => {
        setMemo(initialMemo);
    }, [initialMemo]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(memo);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">メモの編集</h2>
            <textarea
            className="w-full h-40 p-2 border border-gray-300 rounded-md resize-none"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモや補足情報を入力..."
            />
            <div className="mt-4 flex justify-end space-x-2">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
                キャンセル
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                保存
            </button>
            </div>
        </div>
        </div>
    );
};

export default MemoModal;