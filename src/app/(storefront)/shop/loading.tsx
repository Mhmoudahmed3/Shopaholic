import { Skeleton } from "@/components/ui/Skeleton";
import { FilterSidebar } from "@/components/shop/FilterSidebar";

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Skeleton for Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-8 border-b border-neutral-100 dark:border-neutral-900 gap-6">
        <div>
          <Skeleton className="h-10 w-48 mb-3" />
          <div className="flex items-center gap-2">
            <span className="w-8 h-[1px] bg-neutral-300 dark:bg-neutral-700"></span>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="hidden md:block w-56">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Main Content with Skeletons */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* We can mount FilterSidebar directly as it's static/client side */}
        <FilterSidebar />
        
        <div className="flex-1">
          {/* Product Grid Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="group relative">
                 <Skeleton className="aspect-[3/4] w-full overflow-hidden" />
                 <div className="mt-5 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
