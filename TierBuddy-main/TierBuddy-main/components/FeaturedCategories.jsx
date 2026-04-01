// components/FeaturedCategories.js
import { useState } from 'react';

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'movies', label: 'Movies & TV' },
  { id: 'anime', label: 'Anime' },
  { id: 'sports', label: 'Sports' },
  { id: 'music', label: 'Music' },
  { id: 'food', label: 'Food & Drinks' },
  { id: 'popculture', label: 'Pop Culture' },
];

const items = [
  { category: 'gaming', title: 'Gaming', img: '/assets/images/f1.jpg', subtext: 'Rank games, characters, and consoles across genres.', templates: 150, badge: 'Popular' },
  { category: 'movies', title: 'Movies & TV', img: '/assets/images/f2.jpg', subtext:'Compare films, shows, and iconic moments.', templates: 150, badge: 'Trending' },
  { category: 'anime', title: 'Anime', img: '/assets/images/f3.jpg', subtext:'Rank characters, arcs, and series favorites.', templates: 150, badge: 'Popular' },
  { category: 'sports', title: 'Sports', img: '/assets/images/f4.jpg', subtext:'Compare teams, players, and historic performances.', templates: 150, badge: 'New' },
  { category: 'music', title: 'Music', img: '/assets/images/f5.jpg', subtext:'Rank artists, albums, and genres.', templates: 150, badge: 'Popular' },
  { category: 'food', title: 'Food & Drinks', img: '/assets/images/f6.jpg', subtext:'Debate snacks, meals, and drink favorites.', templates: 150, badge: 'Popular' },
];

export default function FeaturedCategories() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems =
    activeTab === 'all' ? items : items.filter((item) => item.category === activeTab);

  return (
    <section className="featured_categories_section">
      <div className="container">
        <div className="my_title_div">
          <span>Live</span>
          <h2>Featured Categories</h2>
          <p>Explore popular topics and start creating tier lists across trending interests</p>
        </div>

        <div className="featured_categories_tabs">
          <ul className="nav nav-pills mb-4 ">
            {categories.map((cat) => (
              <li className="nav-item" key={cat.id}>
                <button
                  className={`nav-link ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="row g-4">
          {filteredItems.map((item, index) => (
            <div className="col-lg-4 col-md-6 col-sm-12" key={index}>
              <div className="category_card_body">
                {item.badge && <span className="badge_category">{item.badge}</span>}
                <img src={item.img} className="category_card_img" alt={item.title} />
                <div className="category_card_text">
                  <h5>{item.title}</h5>
                  <p>{item.subtext}</p>
                  <span>{item.templates}+ templates</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="btn_load_more">
          <button type='button'>Load More</button>
        </div>
      </div>
    </section>
  );
}