import { LongReads, TagCloud, TelegramCard, TopicChips, TopicNav } from "@/components/HomeRails";
import Stream from "@/components/Stream";
import { getAllSeries, getAllTags, getAllTopics, getLongReads, getSortedPostsData } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";

// Bosh sahifa (The Verge uslubi): chapda mavzular, o'rtada kunlar bo'yicha lenta, o'ngda uzun maqolalar va Telegram
export default function Home() {
  const topics = getAllTopics().filter((topic) => topic.count > 0);

  return (
    <>
      {/* Sahifada ko'rinadigan sarlavha yo'q, lekin ekran o'quvchilar va qidiruv tizimlari uchun h1 kerak */}
      <h1 className="sr-only">{SITE_NAME}</h1>

      <div className="mx-auto max-w-[1240px] gap-10 px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[190px_minmax(0,1fr)_300px]">
        <aside className="max-xl:hidden">
          <TopicNav topics={topics} series={getAllSeries()} />
        </aside>

        <div className="min-w-0">
          <Stream posts={getSortedPostsData()}>
            <TopicChips topics={topics} />
          </Stream>
        </div>

        <aside aria-label="Long reads and subscribe" className="flex flex-col gap-9 max-lg:mt-12">
          <LongReads posts={getLongReads(5)} />
          <TelegramCard />
          <TagCloud tags={getAllTags()} />
        </aside>
      </div>
    </>
  );
}
