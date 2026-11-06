import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../core/services/post.service';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { CommentSectionComponent } from '../../shared/components/comment-section/comment-section.component';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, CommentSectionComponent],
  templateUrl: './post-details.component.html'
})
export class PostDetailsComponent implements OnInit {
  @Input() postId?: string;

  private route = inject(ActivatedRoute);
  private postService = inject(PostService);

  post = signal<Post | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.postId || this.route.snapshot.paramMap.get('postId');
    if (id) {
      this.loadPost(id);
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('Post ID not found');
    }
  }

  loadPost(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postService.getPostById(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.post.set(res.data?.post || null);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load this post. It might have been deleted.');
      }
    });
  }

  onPostUpdated(updated: Post): void {
    this.post.set(updated);
  }
}

