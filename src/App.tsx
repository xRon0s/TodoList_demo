import { useState, useMemo, useEffect } from "react";
import type { Todo, Priority } from "./types";
import {match, special_event} from "./.hiddenlist";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";

const secretCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a"
];

const priorityOrder: Record<Priority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

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

  const [keySequence, setKeySequence] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const requiredKey = secretCode[keySequence.length];

      if (e.key === requiredKey) {
        const newSequence = [...keySequence, e.key];
        setKeySequence(newSequence);

        if (newSequence.length === secretCode.length) {
          alert("ゲーム中毒…？")
          document.body.classList.add("secret-activated");
          

          setKeySequence([]);
        }
      } else {
        setKeySequence([]);
        document.body.classList.remove("secret-active");
      }
    };

    const handleReset = () => {
      setKeySequence([]);
      document.body.classList.remove("secret-active");
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleReset);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleReset);
    };
  }, [keySequence]);

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

  const handleExportTodos = () => {
    if (todos.length === 0) {
      alert("エクスポートするタスクがありません。");
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(todos, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "todos-backup.json";
    link.click();
  };

  const handleImportTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const { files } = e.target;

    if (files && files[0]) {
      fileReader.readAsText(files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === "string") {
            const importedTodos: Todo[] = JSON.parse(result).map((todo: any) => ({
              ...todo,
              date: todo.date ? new Date(todo.date) : null,
            }));
            setTodos(importedTodos);
          }
        } catch (error) {
          console.error("ファイルの読み込みに失敗しました:", error);
          alert("ファイルの形式が正しくありません。");
        }
      };
      // Reset the input value to allow re-uploading the same file
      e.target.value = "";
    }
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
  }, [todos,sortBy]);

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
            <div className="backup-restore-container">
        <button onClick={handleExportTodos}>バックアップ</button>
        <label htmlFor="import-button" className="import-label">
          復元する
        </label>
        <input
          id="import-button"
          type="file"
          accept=".json"
          onChange={handleImportTodos}
          style={{ display: "none" }}
        />
      </div>
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

      {(special_event as readonly string[]).includes(inputText) && (
        <span className="errr">📅</span>
      )}

      {(match as readonly string[]).includes(inputText) && (
        <span className="errr">趣味が合いますね</span>
      )}

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
                <span className="todo-label">{todo.text}</span>
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
                    <span className="todo-label">{todo.text}</span>
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
    </div>
  );
};

export default App;