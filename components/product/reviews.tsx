'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { Review } from '@/lib/types';

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      setReviews((data as Review[]) || []);
      setLoading(false);
    };
    fetchReviews();
  }, [productId]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async () => {
    if (!user) {
      toast.info('Please sign in to leave a review');
      return;
    }
    if (!body.trim()) {
      toast.error('Please write a review');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: title.trim() || null,
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error('Could not submit review');
      return;
    }
    toast.success('Review submitted — pending approval');
    setShowForm(false);
    setTitle('');
    setBody('');
    setRating(5);
  };

  return (
    <section className="container-luxury py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <h2 className="font-serif text-3xl mb-4">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-serif text-4xl">{avgRating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={18}
                      className={n <= Math.round(avgRating) ? 'fill-gold-500 text-gold-500' : 'text-border'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">
              No reviews yet. Be the first to share your experience.
            </p>
          )}

          <button
            onClick={() => (user ? setShowForm(!showForm) : toast.info('Please sign in to review'))}
            className="px-6 py-3 border border-ink-900 text-sm font-medium uppercase tracking-wider hover:bg-ink-900 hover:text-white transition-colors"
          >
            Write a Review
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-border rounded-lg p-6 space-y-4"
            >
              <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}>
                      <Star
                        size={24}
                        className={n <= rating ? 'fill-gold-500 text-gold-500' : 'text-border hover:text-gold-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Review title (optional)"
                className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </motion.div>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-border pb-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={n <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-border'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {review.title && <h4 className="font-medium text-sm mb-1">{review.title}</h4>}
                <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
