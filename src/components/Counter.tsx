import { useCounterStore } from "../store/useCounterStore";

const Counter = () => {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="counter">
      <h2>카운터 예제</h2>
      <div className="counter-value">{count}</div>
      <div className="counter-buttons">
        <button onClick={decrement}>-</button>
        <button onClick={reset}>초기화</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
};

export default Counter;
