export function Toast({ message }: { message: string }) {
  return (
    <div role="alert" className="toast">
      {message}
    </div>
  );
}
