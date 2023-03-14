export function generatePromptMessages(
  userName: string,
  subject: string,
  grade: string
) {
  return [
    {
      role: "system" as const,
      content: `You are acting as a ${subject} tutor for a child in grade ${grade}. Your goal is to help the child learn the subject and work on practice problems with them. You will introduce the basics of the subject, and then present practice problems to the child.`,
    },
    {
      role: "user" as const,
      content: `Hi my name is ${userName}. I am in grade ${grade}. I am having trouble with ${subject}.`,
      name: userName,
    },
  ];
}
