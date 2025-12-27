document.addEventListener('DOMContentLoaded', function() {
    // عنصر حاوية الأفلام
    const favoritesContainer = document.getElementById('favorites-container');
    
    // تأثير التمرير على الترويسة
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.site-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // تحميل الأفلام المفضلة من localStorage
    function loadFavorites() {
        // جلب الأفلام المفضلة من localStorage
        const savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
        const favorites = savedMovies.map(movie => {
            // تحديد عنوان الصورة المناسب
            let posterUrl;
            if (movie.poster_path) {
                // إذا كان مسار الصورة هو backdrop_path (من البانر)
                if (movie.poster_path.includes('/backdrops/') || movie.poster_path.startsWith('/')) {
                    posterUrl = movie.poster_path.startsWith('/') 
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : movie.poster_path;
                } else {
                    posterUrl = movie.poster_path;
                }
            } else {
                // صورة افتراضية إذا لم توجد
                posterUrl = "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image";
            }
            
            return {
                id: movie.id || movie.movieId,
                title: movie.title || "بدون عنوان",
                year: movie.release_date ? movie.release_date.substring(0, 4) : (movie.year || "غير معروف"),
                rating: movie.vote_average || movie.rating || 0,
                poster: posterUrl,
                movieData: movie // حفظ البيانات الكاملة للفيلم
            };
        });

        // إذا لم توجد أفلام مفضلة
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">★</div>
                    <h3>لا توجد أفلام في قائمة المفضلة</h3>
                    <p>يمكنك إضافة أفلام إلى المفضلة من خلال النقر على أيقونة القلب في صفحة الأفلام.</p>
                    <a href="index.html" class="explore-btn">تصفح الأفلام</a>
                </div>
            `;
            return;
        }
        
        // عرض الأفلام المفضلة
        favoritesContainer.innerHTML = favorites.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <button class="remove-btn" title="حذف من المفضلة" data-id="${movie.id}">✕</button>
                <div class="movie-poster-container">
                    <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" 
                         onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image'">
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.year}</span>
                        <div class="movie-rating">
                            <span class="star-icon">★</span>
                            <span>${movie.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // إضافة حدث للحذف
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const movieId = parseInt(this.getAttribute('data-id'));
                removeFromFavorites(movieId, this);
            });
        });
        
        // إضافة حدث للبطاقة للانتقال لصفحة الفيلم
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('remove-btn') && 
                    !e.target.closest('.remove-btn')) {
                    const movieId = this.dataset.id;
                    // الانتقال لصفحة مشاهدة الفيلم
                    window.location.href = `watch.html?id=${movieId}`;
                }
            });
        });
    }
    
    // دالة إزالة الفيلم من المفضلة
    function removeFromFavorites(movieId, buttonElement) {
        // جلب الأفلام المفضلة الحالية
        let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
        
        // البحث عن الفيلم المراد حذفه
        const movieIndex = savedMovies.findIndex(movie => movie.id === movieId);
        
        if (movieIndex !== -1) {
            const movieTitle = savedMovies[movieIndex].title;
            
            // إزالة الفيلم من المصفوفة
            savedMovies.splice(movieIndex, 1);
            
            // تحديث localStorage
            localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
            
            // تأثير للحذف
            const movieCard = buttonElement.closest('.movie-card');
            movieCard.style.transform = 'scale(0.8)';
            movieCard.style.opacity = '0';
            
            // عرض إشعار
            showNotification(`تم إزالة "${movieTitle}" من المفضلة`, "error");
            
            // إزالة العنصر بعد انتهاء التأثير
            setTimeout(() => {
                movieCard.remove();
                
                // إذا لم تعد هناك أفلام، إعادة تحميل الحالة الفارغة
                if (favoritesContainer.children.length === 0) {
                    loadFavorites();
                }
                
                // تحديث العداد في الصفحة الرئيسية (إذا كانت مفتوحة)
                if (window.opener && !window.opener.closed) {
                    try {
                        window.opener.updateFavoritesCount && window.opener.updateFavoritesCount();
                    } catch(e) {
                        console.log("لا يمكن تحديث الصفحة الرئيسية");
                    }
                }
            }, 300);
        }
    }
    
    // دالة لعرض الإشعارات
    function showNotification(message, type = "success") {
        // إزالة أي إشعارات سابقة
        const existingNotification = document.querySelector(".notification");
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => notification.classList.add("show"), 10);
        
        // إخفاء الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // إضافة CSS للإشعارات إذا لم تكن موجودة
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                background: #333;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 9999;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                transition: transform 0.3s ease;
                max-width: 90%;
                width: auto;
            }
            
            .notification.success {
                background: #2ecc71;
            }
            
            .notification.error {
                background: #e74c3c;
            }
            
            .notification.show {
                transform: translateX(-50%) translateY(0);
            }
            
            .notification i {
                font-size: 1.2rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    // تحميل الأفلام عند فتح الصفحة
    loadFavorites();
    
    // تحديث قائمة المفضلة عند تغيير التبويب (إذا كان الصفحة مفتوحة في خلفية)
    window.addEventListener('storage', function(e) {
        if (e.key === 'savedMovies') {
            loadFavorites();
        }
    });
});