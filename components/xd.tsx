// "use client";
// import React, { useState, useEffect } from "react";
// import { Spotlight, spotlight } from "@mantine/spotlight";
// import { useDebouncedCallback } from "use-debounce";
// import { IoSearchOutline } from "react-icons/io5";
// import { SearchProductForSpotlight } from "@/actions/user/search-product-for-spotlight";
// import { getFeaturedProducts } from "@/actions/user/get-featured-products";
// import CustomImage from "./CustomImage";

// const SearchSpotlight = () => {
//   const [query, setQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadFeaturedProducts = async () => {
//       try {
//         const featured = await getFeaturedProducts();
//         setFeaturedProducts(featured || []);
//       } catch (error) {
//         console.error("Featured products loading error:", error);
//       }
//     };

//     loadFeaturedProducts();
//   }, []);

//   const onChangeQuery = useDebouncedCallback(async (searchQuery) => {
//     if (searchQuery.length < 2) {
//       setSearchResults(featuredProducts);
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await SearchProductForSpotlight(searchQuery);
//       setSearchResults(response || []);
//     } catch (error) {
//       console.error("Search error:", error);
//       setSearchResults([]);
//     } finally {
//       setLoading(false);
//     }
//   }, 300);

//   useEffect(() => {
//     setSearchResults(featuredProducts);
//   }, [featuredProducts]);

//   const renderProductVariants = (product) => {
//     return product.Variant.map((variant) => (
//       <Spotlight.Action
//         key={`${product.id}-${variant.id}`}
//         onClick={() => console.log({ product, variant })}
//       >
//         <div className="flex items-center gap-4 w-full p-2">
//           <div className="w-20 h-20 relative">
//             {variant.Image?.[0]?.url && (
//               <CustomImage
//                 src={variant.Image[0].url.replace(/\.[^/.]+$/, "")}
//                 quality={40}
//               />
//             )}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium truncate">
//               {product.name}
//               {variant.value && (
//                 <span className="ml-2 text-xs text-gray-500">
//                   {variant.unit
//                     ? `${variant.value}${variant.unit}`
//                     : variant.value}
//                 </span>
//               )}
//             </p>
//             {product.shortDescription && (
//               <p className="text-xs text-gray-500 truncate">
//                 {product.shortDescription}
//               </p>
//             )}
//             <div className="flex items-center gap-2">
//               <p className="text-xs font-semibold text-blue-600">
//                 {variant.price} TL
//               </p>
//               {variant.discount > 0 && (
//                 <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
//                   %{variant.discount} İndirim
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </Spotlight.Action>
//     ));
//   };

//   return (
//     <>
//       <style jsx global>{`
//         .mantine-Spotlight-action[data-selected] {
//           background-color: transparent !important;
//         }
//         .mantine-Spotlight-action:hover {
//           background-color: var(--mantine-color-gray-0) !important;
//         }
//       `}</style>
//       <IoSearchOutline
//         size={28}
//         className="cursor-pointer"
//         onClick={() => spotlight.open()}
//       />
//       <Spotlight.Root
//         query={query}
//         onQueryChange={(newQuery) => {
//           setQuery(newQuery);
//           onChangeQuery(newQuery);
//         }}
//         styles={{
//           action: {
//             "&[data-selected]": {
//               backgroundColor: "transparent",
//             },
//             "&:hover": {
//               backgroundColor: "var(--mantine-color-gray-0)",
//             },
//           },
//         }}
//       >
//         <Spotlight.Search
//           placeholder="Ürün Ara"
//           rightSection={
//             loading ? (
//               <div className="animate-spin">
//                 <IoSearchOutline size={30} />
//               </div>
//             ) : (
//               <IoSearchOutline size={30} />
//             )
//           }
//         />

//         <Spotlight.ActionsList>
//           {searchResults.length > 0 ? (
//             searchResults.flatMap(renderProductVariants)
//           ) : (
//             <Spotlight.Empty>
//               {query.length < 2
//                 ? "En az 2 karakter girin..."
//                 : "Sonuç bulunamadı..."}
//             </Spotlight.Empty>
//           )}
//         </Spotlight.ActionsList>
//       </Spotlight.Root>
//     </>
//   );
// };

// export default SearchSpotlight;
