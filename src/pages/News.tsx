import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { useFinancialNews, useBusinessNews, useCryptoNews, useCustomNews } from "@/hooks/useNews";

const News = () => {
  // Fetch real news from APIs
  const { data: financialNews, isLoading: isLoadingFinancial } = useFinancialNews(12);
  const { data: businessNews, isLoading: isLoadingBusiness } = useBusinessNews(12);
  const { data: cryptoNews, isLoading: isLoadingCrypto } = useCryptoNews(12);
  const { data: uaeNews, isLoading: isLoadingUAE } = useCustomNews("UAE OR Dubai OR Abu Dhabi market", 12);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Newspaper className="h-10 w-10 mr-3 text-primary" />
          Financial News
        </h1>
        <p className="text-muted-foreground">Latest updates from global markets</p>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="global">Global Markets</TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          <TabsTrigger value="business">Business News</TabsTrigger>
          <TabsTrigger value="uae">UAE Market</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          {isLoadingFinancial ? (
            <NewsLoadingSkeleton />
          ) : (
            <NewsGrid articles={financialNews?.articles || []} getTimeAgo={getTimeAgo} />
          )}
        </TabsContent>

        <TabsContent value="crypto">
          {isLoadingCrypto ? (
            <NewsLoadingSkeleton />
          ) : (
            <NewsGrid articles={cryptoNews?.articles || []} getTimeAgo={getTimeAgo} />
          )}
        </TabsContent>

        <TabsContent value="business">
          {isLoadingBusiness ? (
            <NewsLoadingSkeleton />
          ) : (
            <NewsGrid articles={businessNews?.articles || []} getTimeAgo={getTimeAgo} />
          )}
        </TabsContent>

        <TabsContent value="uae">
          {isLoadingUAE ? (
            <NewsLoadingSkeleton />
          ) : (
            <NewsGrid articles={uaeNews?.articles || []} getTimeAgo={getTimeAgo} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Loading skeleton component
const NewsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-6">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// News grid component
const NewsGrid = ({ articles, getTimeAgo }: { articles: any[]; getTimeAgo: (date: string) => string }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No articles available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <Card key={index} className="hover-lift overflow-hidden group cursor-pointer">
          <div className="relative h-48 overflow-hidden bg-muted">
            {article.urlToImage ? (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Newspaper className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            <Badge className="absolute top-4 left-4">News</Badge>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {article.description || "No description available"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {getTimeAgo(article.publishedAt)}
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="group/button">
                  Read More
                  <ExternalLink className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">{article.source.name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default News;
