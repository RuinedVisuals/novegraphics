export interface Film {
    id: string;
    title: string;
    subTitle: string;
    year: string;
    category: string;
    image: string;
    spine?: string;
    back?: string;
    accent: string;
    description: string;
}

export const films: Film[] = [
    {
        id: "1",
        title: "Street Origins",
        subTitle: "SHIGAI NO KIGEN / 市街の起源",
        year: "1994",
        category: "DOCUMENTARY",
        image: "/posters/poster-1.jpg",
        spine: "/posters/poster-1-spine.jpg",
        accent: "#ff2a1f",
        description:
            "The definitive look at the birth of the underground movement.",
    },
    {
        id: "2",
        title: "Concrete Jungle",
        subTitle: "KONKURITO NO JANGURU / コンクリートのジャングル",
        year: "1997",
        category: "THRILLER",
        image: "/posters/poster-2.jpg",
        accent: "#3a0618",
        description:
            "Survival of the fittest in the heart of metropolitan chaos.",
    },
    {
        id: "3",
        title: "Throne of Blood",
        subTitle: "KUMONOSU-JO / 蜘蛛巣城",
        year: "1957",
        category: "CLASSIC",
        image: "/posters/poster-3.jpg",
        accent: "#ff2a1f",
        description:
            "Raw recordings from the basement that changed everything.",
    },
    {
        id: "4",
        title: "Night Crawlers",
        subTitle: "YORU NO HAIKAI-SHA / 夜の徘徊者",
        year: "1995",
        category: "NOIR",
        image: "/posters/poster-4.jpg",
        accent: "#3a0618",
        description:
            "Following the shadows where the real stories are told.",
    },
    {
        id: "5",
        title: "The Archive",
        subTitle: "AISU NO KIGEN / アイスの起源",
        year: "1999",
        category: "HISTORY",
        image: "/posters/poster-5.jpg",
        accent: "#ff2a1f",
        description:
            "A collection of lost tapes from the golden era of boom bap.",
    },
];