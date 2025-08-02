import { githubUrl, title } from "~/config";
import { Github } from "~/core/icons";

export function AppHeader() {
  return (
    <div className="flex items-center justify-between w-full">
      <a
        className="font-serif text-lg font-extralight text-gray-500"
        href={githubUrl}
        target="_blank"
      >
        {title}
      </a>

      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Github className="w-6 h-6" />
      </a>
    </div>
  );
}
