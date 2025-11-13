import { useState, useMemo } from "react";
import type { Todo, Priority } from "./types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import MemoModal from "./components/MemoModal";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // ページ読み込み時の自動読み込みは削除し、空の配列から開始
    return [];
  });
  const [newTodo, setNewTodo] = useState("");
  const [newTodoDate, setNewTodoDate] = useState<Date | null>(new Date());
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );
  const [sort, setSort] = useState<"date" | "priority">("date");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // --- 1. ローカルストレージへの自動保存機能を削除 ---
  // useEffect(() => {
  //   try {
  //     localStorage.setItem("todos", JSON.stringify(todos));
  //   } catch (error) {
  //     console.error("Failed to save todos to local storage:", error);
  //   }
  // }, [todos]);

  // --- 2. ファイル保存・読み込み機能を追加 ---
  const handleSaveToFile = () => {
    const jsonString = JSON.stringify(todos, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "todos.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        try {
          const loadedTodos = JSON.parse(text);
          // ここで読み込んだデータが正しい形式か簡単なチェックをすることも可能
          setTodos(loadedTodos);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("無効なファイル形式です。");
        }
      }
    };
    reader.readAsText(file);
    // 同じファイルを連続で読み込めるように値をリセット
    event.target.value = "";
  };

  const handleOpenModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  const handleSaveMemo = (memo: string) => {
    if (!selectedTodo) return;
    setTodos(
      todos.map((todo) =>
        todo.id === selectedTodo.id ? { ...todo, memo: memo } : todo
      )
    );
    handleCloseModal();
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.length > 15) {
      return;
    }
    if (newTodo.trim() === "") return;
    const todoDate = newTodoDate ? new Date(newTodoDate) : null;
    const newTodoItem: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      priority: newTodoPriority,
      date: todoDate,
    };
    setTodos([...todos, newTodoItem]);
    setNewTodo("");
    setNewTodoDate(new Date());
  };

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const priorityOrder: Record<Priority, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedTodos = useMemo(() => {
    let filteredTodos = todos;
    if (filter === "completed") {
      filteredTodos = todos.filter((todo) => todo.completed);
    } else if (filter === "incomplete") {
      filteredTodos = todos.filter((todo) => !todo.completed);
    }

    const sorted = [...filteredTodos];
    if (sort === "priority") {
      sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    } else if (sort === "date") {
      sorted.sort((a, b) => {
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return a.date.getTime() - b.date.getTime();
      });
    }
    return sorted;
  }, [todos, sort, filter]);

  const todosForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return todos.filter((todo) => {
      if (!todo.date) return false;
      return (
        todo.date.getFullYear() === selectedDate.getFullYear() &&
        todo.date.getMonth() === selectedDate.getMonth() &&
        todo.date.getDate() === selectedDate.getDate()
      );
    });
  }, [todos, selectedDate]);

  return (
    <div className="App">
      <h1>Todo App</h1>

      <div className="file-operations">
        <button onClick={handleSaveToFile}>ファイルに保存</button>
        <label className="file-load-button">
          ファイルから読み込む
          <input
            type="file"
            accept=".json"
            onChange={handleLoadFromFile}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* 2. フォームに onSubmit を追加 */}
      <form className="add-todo-form" onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="新しいタスク"
        />
        <input
          type="datetime-local"
          value={
            newTodoDate
              ? new Date(newTodoDate.getTime() - newTodoDate.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
          onChange={(e) =>
            setNewTodoDate(e.target.value ? new Date(e.target.value) : null)
          }
        />
        <select
          value={newTodoPriority}
          onChange={(e) => setNewTodoPriority(e.target.value as Priority)}
        >
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <button type="submit">追加</button>
      </form>

      <div className="view-toggle">
        <button onClick={() => setView(view === "list" ? "calendar" : "list")}>
          {view === "list" ? "カレンダー表示に切り替え" : "リスト表示に切り替え"}
        </button>
      </div>

      {view === "list" ? (
        <>
          <div className="filter-sort-container">
            <div>
              <label>フィルター : </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "completed" | "incomplete")}
              >
                <option value="all">すべて</option>
                <option value="completed">完了済み</option>
                <option value="incomplete">未完了</option>
              </select>
            </div>
            <div>
              <label>並び替え : </label>
              <select
                onChange={(e) =>
                  setSort(
                    e.target.value as "date" | "priority"
                  )
                }
              >
                <option value="date">日付順</option>
                <option value="priority">優先度</option>
              </select>
            </div>
          </div>

          <ul className="todo-list">
            {sortedTodos.map((todo) => (
              <li
                key={todo.id}
                className={`${todo.completed ? "completed" : "none"} ${
                  todo.priority
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                />
                <div className="relative group flex items-center">
                  <span
                    className="task-text"
                    onClick={() => handleOpenModal(todo)}
                  >
                    {todo.text}
                  </span>
                  {todo.memo && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {todo.memo}
                    </span>
                  )}
                </div>
                <span className="date-label">
                  {todo.date?.toLocaleString()}
                </span>
                <span className="priority-label">{todo.priority}</span>
                <button onClick={() => handleDeleteTodo(todo.id)}>削除</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="calendar-view">
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            tileContent={({ date, view }) => {
              if (view === "month") {
                const hasTodo = todos.some(
                  (todo) =>
                    todo.date &&
                    todo.date.getFullYear() === date.getFullYear() &&
                    todo.date.getMonth() === date.getMonth() &&
                    todo.date.getDate() === date.getDate()
                );
                return hasTodo ? <div className="todo-dot"></div> : null;
              }
              return null;
            }}
          />
          <div className="selected-date-todos">
            <h3>
              {selectedDate?.toLocaleDateString()} のタスク
            </h3>
            {todosForSelectedDate.length > 0 ? (
              <ul>
                {todosForSelectedDate.map((todo) => (
                  <li
                    key={todo.id}
                    className={`${todo.completed ? "completed" : "none"} ${
                      todo.priority
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                    />
                    <div className="relative group flex items-center">
                      <div className="relative group flex items-center">
                        <span
                          className="task-text"
                          onClick={() => handleOpenModal(todo)}
                        >
                          {todo.text}
                        </span>
                        {todo.memo && (
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {todo.memo}
                          </span>
                        )}
                      </div>
                      {todo.memo && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {todo.memo}
                        </span>
                      )}
                    </div>
                    <span className="priority-label">{todo.priority}</span>
                    <button onClick={() => handleDeleteTodo(todo.id)}>
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>この日のタスクはありません。</p>
            )}
          </div>
        </div>
      )}
      <MemoModal
        isOpen={isModalOpen}
        initialMemo={selectedTodo?.memo}
        onClose={handleCloseModal}
        onSave={handleSaveMemo}
      />
    </div>
  );
};

export default App;