import NoseGame from './components/NoseGame';

export default function Home() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <NoseGame />
    </div>
  );
}
