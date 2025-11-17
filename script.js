// DOM元素获取
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchHistory = document.getElementById('search-history');
const searchTabs = document.querySelectorAll('.search-tab');
const navItems = document.querySelectorAll('.nav-item');

// 搜索引擎配置
const searchEngines = {
    baidu: 'https://www.baidu.com/s?wd=',
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    sogou: 'https://www.sogou.com/web?query='
};

// 当前选中的搜索引擎
let currentEngine = localStorage.getItem('defaultSearchEngine') || 'baidu';

// 初始化
function init() {
    // 设置默认搜索引擎
    setActiveSearchTab(currentEngine);
    
    // 加载搜索历史
    loadSearchHistory();
    
    // 绑定事件监听
    bindEvents();
}

// 设置激活的搜索标签
function setActiveSearchTab(engine) {
    searchTabs.forEach(tab => {
        if (tab.dataset.engine === engine) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// 绑定事件
function bindEvents() {
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', handleSearch);
    
    // 搜索框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 搜索框聚焦事件
    searchInput.addEventListener('focus', showSearchHistory);
    
    // 搜索框失焦事件（延迟隐藏，以便点击历史记录）
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchHistory.style.display = 'none';
        }, 200);
    });
    
    // 搜索引擎标签点击事件
    searchTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentEngine = e.target.dataset.engine;
            localStorage.setItem('defaultSearchEngine', currentEngine);
            setActiveSearchTab(currentEngine);
            // 添加波纹效果
            createRipple(e, e.target);
        });
    });
    
    // 导航项点击事件（添加波纹效果）
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            createRipple(e, item);
        });
    });
    
    // 键盘快捷键支持
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 处理搜索
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        // 保存到搜索历史
        saveToSearchHistory(query);
        
        // 执行搜索
        const searchUrl = searchEngines[currentEngine] + encodeURIComponent(query);
        window.open(searchUrl, '_blank');
        
        // 清空搜索框
        searchInput.value = '';
        
        // 隐藏搜索历史
        searchHistory.style.display = 'none';
    }
}

// 保存到搜索历史
function saveToSearchHistory(query) {
    let history = getSearchHistory();
    
    // 移除重复项
    history = history.filter(item => item !== query);
    
    // 添加到开头
    history.unshift(query);
    
    // 限制历史记录数量为10条
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    // 保存到本地存储
    localStorage.setItem('searchHistory', JSON.stringify(history));
    
    // 更新搜索历史UI
    loadSearchHistory();
}

// 获取搜索历史
function getSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
}

// 加载搜索历史
function loadSearchHistory() {
    const history = getSearchHistory();
    searchHistory.innerHTML = '';
    
    if (history.length > 0) {
        history.forEach(query => {
            const item = document.createElement('div');
            item.className = 'search-history-item';
            item.innerHTML = `
                <span>${query}</span>
                <span class="remove-history" data-query="${query}">×</span>
            `;
            
            // 点击历史记录项
            item.querySelector('span:first-child').addEventListener('click', () => {
                searchInput.value = query;
                handleSearch();
            });
            
            // 点击删除按钮
            item.querySelector('.remove-history').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromSearchHistory(query);
            });
            
            searchHistory.appendChild(item);
        });
    } else {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'search-history-item';
        emptyItem.textContent = '暂无搜索历史';
        emptyItem.style.color = '#999';
        emptyItem.style.cursor = 'default';
        searchHistory.appendChild(emptyItem);
    }
}

// 从搜索历史中移除
function removeFromSearchHistory(query) {
    let history = getSearchHistory();
    history = history.filter(item => item !== query);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    loadSearchHistory();
}

// 显示搜索历史
function showSearchHistory() {
    const history = getSearchHistory();
    if (history.length > 0) {
        searchHistory.style.display = 'block';
    }
}

// 处理键盘快捷键
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Esc 清除搜索内容
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchHistory.style.display = 'none';
    }
}

// 创建波纹效果
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    // 移除波纹效果
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 搜索功能（针对页面内导航项）
function searchNavItems(query) {
    const lowerQuery = query.toLowerCase();
    let found = false;
    
    navItems.forEach(item => {
        const name = item.dataset.name.toLowerCase();
        
        if (name.includes(lowerQuery)) {
            // 高亮显示匹配的项
            item.classList.add('highlight');
            found = true;
            
            // 3秒后移除高亮
            setTimeout(() => {
                item.classList.remove('highlight');
            }, 3000);
            
            // 滚动到匹配的项
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    return found;
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 平滑滚动效果
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 导航项悬停动画增强
navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transition = 'all 0.3s ease';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transition = 'all 0.3s ease';
    });
});

// 页面加载时的动画效果
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// 监听页面滚动，为导航项添加渐入效果
function handleScroll() {
    const sections = document.querySelectorAll('.category-section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.8) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
}

// 初始化滚动监听
window.addEventListener('scroll', handleScroll);
// 初始加载时执行一次
handleScroll();

// 统计点击次数
function trackClick(element) {
    // 获取点击统计数据
    let clickStats = JSON.parse(localStorage.getItem('clickStats') || '{}');
    const name = element.dataset.name || 'unknown';
    
    // 更新点击次数
    if (clickStats[name]) {
        clickStats[name]++;
    } else {
        clickStats[name] = 1;
    }
    
    // 保存到本地存储
    localStorage.setItem('clickStats', JSON.stringify(clickStats));
}

// 为所有导航项添加点击统计
navItems.forEach(item => {
    item.addEventListener('click', () => {
        trackClick(item);
    });
});