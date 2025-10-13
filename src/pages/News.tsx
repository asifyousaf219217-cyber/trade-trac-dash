import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Newspaper } from "lucide-react";

const News = () => {
  const newsArticles = {
    global: [
      {
        title: "Tech Giants Rally as AI Innovation Drives Market Optimism",
        source: "Financial Times",
        time: "2 hours ago",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
        excerpt: "Major technology companies see significant gains as artificial intelligence breakthroughs fuel investor enthusiasm.",
      },
      {
        title: "Federal Reserve Signals Potential Rate Adjustments",
        source: "Bloomberg",
        time: "4 hours ago",
        category: "Markets",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=250&fit=crop",
        excerpt: "Central bank officials hint at possible policy changes in response to economic indicators.",
      },
      {
        title: "Oil Prices Surge Amid Supply Chain Concerns",
        source: "Reuters",
        time: "6 hours ago",
        category: "Energy",
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=250&fit=crop",
        excerpt: "Global energy markets react to geopolitical tensions and production updates.",
      },
    ],
    crypto: [
      {
        title: "Bitcoin Reaches New Milestone as Institutional Adoption Grows",
        source: "CoinDesk",
        time: "1 hour ago",
        category: "Cryptocurrency",
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=250&fit=crop",
        excerpt: "Leading cryptocurrency shows strength as major financial institutions increase exposure.",
      },
      {
        title: "Ethereum Upgrade Enhances Network Efficiency",
        source: "Crypto News",
        time: "3 hours ago",
        category: "Blockchain",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
        excerpt: "Major network improvements promise faster transactions and reduced fees.",
      },
    ],
    business: [
      {
        title: "Quarterly Earnings Exceed Expectations Across Multiple Sectors",
        source: "Wall Street Journal",
        time: "5 hours ago",
        category: "Business",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        excerpt: "Corporate America delivers strong financial results despite economic headwinds.",
      },
      {
        title: "Merger and Acquisition Activity Reaches Year High",
        source: "CNBC",
        time: "7 hours ago",
        category: "M&A",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
        excerpt: "Deal-making accelerates as companies seek strategic growth opportunities.",
      },
    ],
    uae: [
      {
        title: "Dubai Financial Market Shows Strong Growth Momentum",
        source: "Gulf News",
        time: "3 hours ago",
        category: "UAE Markets",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop",
        excerpt: "Local stock exchanges benefit from regional economic expansion and foreign investment.",
      },
      {
        title: "Abu Dhabi Announces Major Infrastructure Investment Plan",
        source: "The National",
        time: "5 hours ago",
        category: "Development",
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
        excerpt: "Capital city unveils ambitious projects to support economic diversification goals.",
      },
    ],
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

        {Object.entries(newsArticles).map(([category, articles]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <Card key={index} className="hover-lift overflow-hidden group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <Badge className="absolute top-4 left-4">{article.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.time}
                      </div>
                      <Button variant="ghost" size="sm" className="group/button">
                        Read More
                        <ExternalLink className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">{article.source}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default News;
