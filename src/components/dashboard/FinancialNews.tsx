"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

export function FinancialNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch("/api/news");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNews(data);
                }
            } catch (error) {
                console.error("Failed to load news", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const d = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    return (
        <Card className="glass-panel border-0 shadow-xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50 z-0" />
            <CardHeader className="relative z-10 pb-2 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-blue-400" />
                        Live Market News
                    </CardTitle>
                    <span className="text-xs font-mono text-muted-foreground bg-white/5 py-1 px-2 rounded">Yahoo Finance</span>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 p-0">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse flex flex-col gap-2">
                                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                <div className="h-3 bg-white/5 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto custom-scrollbar">
                        {news.map((item, i) => (
                            <a
                                key={i}
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="block p-4 hover:bg-white/5 transition-colors group/item"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="text-sm text-slate-200 font-medium group-hover/item:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                        {item.title}
                                    </h4>
                                    <ExternalLink className="h-3 w-3 text-slate-500 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 mt-1" />
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimeAgo(item.pubDate)}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
