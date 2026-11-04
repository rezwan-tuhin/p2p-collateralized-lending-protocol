function ProductCard({title, price = 0, isAvailable = false}) {

    return(
        <>
            <div className="flex items-center justify-center h-screen w-full">
            <div className="">
            <h3 className="text-md text-[#00ff00]">{title}</h3>
            <p>price: {price}</p>
            <span className={isAvailable ? "text-green" : "text-red"}>{isAvailable ? "in stock" : "out of stock"}</span>
        </div>
            </div>
        </>
    )
}
export default ProductCard;


// 1. create loan function parameter যুক্ত একটা form লাগবে। 
// 2. loans Loan struct 
// 3. approve, repay, liquidate

