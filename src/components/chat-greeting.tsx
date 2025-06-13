export function ChatGreeting() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <h1 className="font-bold text-2xl text-brand">Good to see you!</h1>
      <h1 className="mb-2 font-bold text-4xl text-brand-700">
        What can I help with?
      </h1>
      <p className="text-brand-700 text-sm">
        You can ask me anything. I'm available 24/7.
      </p>
    </div>
  );
}
