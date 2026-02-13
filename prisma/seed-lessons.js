
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding learn feature...');

    const lessons = [
        {
            title: "Introduction to JavaScript Variables",
            slug: "js-variables",
            description: "Learn how to store data using variables in JavaScript.",
            content: `
# Variables in JavaScript

Variables are like containers for storing data values. In JavaScript, we can declare variables using \`var\`, \`let\`, or \`const\`.

## The \`let\` keyword
The \`let\` keyword was introduced in ES6 (2015) and is the modern way to declare variables that can change.

\`\`\`javascript
let message = "Hello World";
console.log(message);
\`\`\`

## The \`const\` keyword
Variables defined with \`const\` cannot be Redeclared. Variables defined with \`const\` cannot be Reassigned.

\`\`\`javascript
const PI = 3.14159;
\`\`\`

## Instructions
1. Declare a variable named \`myName\` using \`let\` and assign it your name as a string.
2. Declare a constant named \`birthYear\` using \`const\` and assign it your birth year.
3. Log both to the console.
      `,
            order: 1,
            initialCode: `// Write your code here
`,
            solutionCode: `let myName = "Alice";
const birthYear = 1990;
console.log(myName);
console.log(birthYear);`,
            testCases: JSON.stringify([
                { type: "regex", value: "let\\s+myName\\s*=", message: "Did you declare 'myName' using 'let'?" },
                { type: "regex", value: "const\\s+birthYear\\s*=", message: "Did you declare 'birthYear' using 'const'?" },
                { type: "regex", value: "console\\.log\\(.*myName.*\\)", message: "Did you log 'myName'?" }
            ])
        },
        {
            title: "JavaScript Functions",
            slug: "js-functions",
            description: "Learn how to define and call functions.",
            content: `
# Functions

A JavaScript function is a block of code designed to perform a particular task. A function is executed when "something" invokes it (calls it).

## Function Syntax

\`\`\`javascript
function name(parameter1, parameter2, parameter3) {
  // code to be executed
}
\`\`\`

## Instructions
1. Create a function named \`greet\` that takes a \`name\` parameter.
2. The function should strictly return the string "Hello, " plus the name.
3. Call the function with "World" and log the result.
      `,
            order: 2,
            initialCode: `// Create your function here
`,
            solutionCode: `function greet(name) {
  return "Hello, " + name;
}
console.log(greet("World"));`,
            testCases: JSON.stringify([
                { type: "regex", value: "function\\s+greet", message: "Did you define a function named 'greet'?" },
                { type: "regex", value: "return\\s+[\"']Hello,\\s+[\"']\\s*\\+\\s*name", message: "Does your function return 'Hello, ' + name?" }
            ]),
            language: "javascript"
        }
    ];

    for (const lesson of lessons) {
        const existing = await prisma.lesson.findUnique({
            where: { slug: lesson.slug }
        });

        if (!existing) {
            await prisma.lesson.create({
                data: lesson
            });
            console.log(`Created lesson: ${lesson.title}`);
        } else {
            console.log(`Lesson already exists: ${lesson.title}`);

            // Optional: Update existing lesson content during dev
            await prisma.lesson.update({
                where: { slug: lesson.slug },
                data: lesson
            });
            console.log(`Updated lesson: ${lesson.title}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
