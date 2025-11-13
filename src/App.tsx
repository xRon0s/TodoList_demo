import { useState, useMemo } from "react";
import type { Todo, Priority } from "./types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import MemoModal from "./components/MemoModal";


const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");
  const [date, setDate] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [sortBy, setSortBy] = useState<
    "priority" | "default" | "completed" | "date"
  >("default");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setselectedTodo] = useState<Todo | null>(null);

  const handleOpenModal = (todo: Todo) => {
    setselectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setselectedTodo(null);
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
    if (inputText.length > 15) {
      return;
    }
    if (inputText.trim() === "") return;
    const newTodo: Todo = {
      id: Date.now(),
      text: inputText,
      completed: false,
      priority: priority,
      date: date ? new Date(date) : null,
    };
    setTodos([...todos, newTodo]);
    setInputText("");
    setDate("");
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
    const sorted = [...todos];
    if (sortBy === "priority") {
      sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    } else if (sortBy === "completed") {
      sorted.sort((a, b) => Number(b.completed) - Number(a.completed));
    } else if (sortBy === "date") {
      sorted.sort((a, b) => {
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return a.date.getTime() - b.date.getTime();
      });
    }
    return sorted;
  }, [todos, sortBy]);

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
    <div className="app">
      <h1>TodoApp</h1>
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="追加するタスクの名前を入力"
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
        <button type="submit">追加</button>
      </form>

      {inputText.length > 15 && (
        <span className="error">⚠タスク名は15文字以内で入力してください</span>
      )}

      <div className="err"></div>

      <div className="view-switch-container">
        <button onClick={() => setView(view === "list" ? "calendar" : "list")}>
          {view === "list" ? "カレンダー表示に切り替え" : "リスト表示に切り替え"}
        </button>
      </div>

      {view === "list" ? (
        <>
          <div>
            <label>並び替え : </label>
            <select
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "priority"
                    | "default"
                    | "completed"
                    | "date"
                )
              }
            >
              <option value="default">追加順</option>
              <option value="priority">優先度</option>
              <option value="completed">完了</option>
              <option value="date">日付順</option>
            </select>
          </div>

          <ul>
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
                {/* --- ここから変更 --- */}
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
                {/* --- ここまで変更 --- */}
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