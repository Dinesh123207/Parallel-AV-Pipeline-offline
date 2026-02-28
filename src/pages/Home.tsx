import { Outlet } from "react-router-dom";

type Props = {};

const Home = () => {
  return (
    <>
      <div className="home min-h-screen mx-auto font-sans">
        <nav className="h-16 flex p-2 items-center bg-zinc-800">
          <div className="nav-body w-5/6 mx-auto">
            <img
              src="/logo.png"
              alt="MAUT"
              className="h-full w-[200px] object-contain"
            />
          </div>
        </nav>

        <Outlet />
      </div>
    </>
  );
};

export default Home;
