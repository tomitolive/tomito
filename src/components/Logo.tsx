import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 group select-none"
    >
     

      {/* Text */}
      <div className="flex flex-col leading-none">

        <span
          className="text-3xl font-extrabold tracking-wide
                     text-transparent bg-clip-text
                     bg-gradient-to-r from-red-500 via-orange-500 to-red-600
                     drop-shadow-[0_0_15px_rgba(255,80,0,0.8)]"
        >
          TOMITO
        </span>

       
      </div>
    </Link>
  );
};

export default Logo;
