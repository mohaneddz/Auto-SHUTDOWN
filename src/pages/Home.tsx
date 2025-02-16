import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const goSettings = () => {
    navigate('/Settings');
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">
      <h1>
        Home Component
      </h1>
      <Button onClick={goSettings} text="Go to Settings" />

    </div>
  );
};
