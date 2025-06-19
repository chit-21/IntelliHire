import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";
import { type TechIconProps } from '@/types';

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const techIcons = getTechLogos(techStack);

  // Fallback handler for broken images
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/tech.svg";
  };

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, displayTech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{displayTech}</span>

          <Image
            src={url}
            alt={displayTech}
            width={100}
            height={100}
            className="size-5"
            
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
