export class CircularDependencyException extends Error {
  constructor(context?: string) {
    const ctx = context ? ` inside ${context}` : ``;
    super(
      `A circular dependency has been detected${ctx}. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Also, try to eliminate barrel files because they can lead to an unexpected behavior too.`,
    );
  }
}
