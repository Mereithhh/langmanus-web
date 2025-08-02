import { githubUrl, title } from "~/config";

export function AppHeader() {
  return (
    <div>
      <a
        className="font-serif text-lg font-extralight text-gray-500"
        href={githubUrl}
        target="_blank"
      >
        {title}
      </a>
    </div>
  );
}
