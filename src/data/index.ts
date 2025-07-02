export interface FunctionSpec {
  id: string;
  description: string;
  displayName: string;
}

export const functionSpecs: FunctionSpec[] = [
  {
    id: "abc12345-def6-7890-ghij-klmnopqrstuv",
    description: "Ends the conversation with a successful outcome",
    displayName: "End Conversation",
  },
  {
    id: "xyz98765-wxyz-4321-lmno-pqrstuvwxyza",
    description: "Transfers the call to a human representative",
    displayName: "Transfer Call",
  },
  {
    id: "def45678-ghi9-0123-jklm-nopqrstuvwxyz",
    description: "Searches the knowledge base for relevant information",
    displayName: "Knowledge",
  },
  {
    id: "ghi78901-jkl2-3456-mnop-qrstuvwxyzabc",
    description: "Schedules or checks calendar appointments",
    displayName: "Calendar",
  },
];

// Helper functions
export function getFunctionById(id: string): FunctionSpec | undefined {
  return functionSpecs.find((spec) => spec.id === id);
}

export function getAllFunctions(): FunctionSpec[] {
  return functionSpecs;
}
