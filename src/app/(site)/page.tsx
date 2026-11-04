import { LongReads, TagCloud, TelegramCard, TopicChips, TopicNav } from "@/components/HomeRails";
import Stream from "@/components/Stream";
import { getAllSeries, getAllTags, getAllTopics, getLongReads, getSortedPostsData } from "@/lib/posts";
import { SITE_DESCRIPTION } from "@/lib/site";

// Bosh sahifa (The Verge uslubi): katta sarlavha, chapda mavzular, o'rtada kunlar bo'yicha lenta, o'ngda uzun maqolalar va Telegram
export default function Home() {
  const topics = getAllTopics().filter((topic) => topic.count > 0);

  return (
    <>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2.5 border-b border-line-strong pb-6 pt-4 sm:pb-7 sm:pt-5">
          <h1 className="font-display text-[clamp(76px,21vw,190px)] font-normal leading-[0.82] tracking-normal">Kamalovic</h1>
          <p className="max-w-[340px] font-serif text-[17px] leading-snug text-prose sm:mb-2.5 sm:text-[21px]">{SITE_DESCRIPTION}.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] gap-10 px-4 pb-20 pt-5 sm:px-6 sm:pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[190px_minmax(0,1fr)_300px]">
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
