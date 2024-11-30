import NavBar from "@/utils/nav";

const Home = () => {
    return (
        <>
            <NavBar />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-4xl font-bold text-blue-600 mb-4">
                        Welcome to Scriptorium!
                    </h1>
                    <p className="text-xl text-gray-700">
                        An online coding and sharing platform
                    </p>
                </div>
            </div>
        </>
    );
};

export default Home;