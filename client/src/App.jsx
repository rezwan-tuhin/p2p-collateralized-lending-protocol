
import './App.css'
import ProductCard from './components/ChildComponent'

function App() {

  const title = "Product 1";
  const price = 100;
  const isAvailable = true;

  return (
     <>
        <ProductCard title={title} price={price} isAvailable={isAvailable}/>
     </>
  )
}

export default App


//1. 