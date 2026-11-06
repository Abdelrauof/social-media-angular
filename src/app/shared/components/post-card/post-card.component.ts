import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post } from '../../../core/models/post.model';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TimeAgoPipe],
  templateUrl: './post-card.component.html'
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
  @Input() isDetailView = false;

  @Output() postDeleted = new EventEmitter<string>();
  @Output() postUpdated = new EventEmitter<Post>();

  authService = inject(AuthService);
  private postService = inject(PostService);
  private router = inject(Router);

  menuOpen = signal(false);
  isEditing = signal(false);
  editContent = signal('');
  isUpdating = signal(false);
  isDeleting = signal(false);
  showDeleteModal = signal(false);
  showImageModal = signal(false);

  get isOwner(): boolean {
    const currentId = this.authService.currentUser()?._id;
    return !!(currentId && this.post.user?._id && currentId === this.post.user._id);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onLike(): void {
    const prevLiked = this.post.isLiked;
    const prevCount = this.post.likesCount ?? 0;

    this.post.isLiked = !prevLiked;
    this.post.likesCount = this.post.isLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    this.postService.likePost(this.post._id).subscribe({
      next: (res) => {
        if (res.data?.post) {
          this.post.likesCount = res.data.post.likesCount;
        }
      },
      error: () => {
        this.post.isLiked = prevLiked;
        this.post.likesCount = prevCount;
      }
    });
  }

  onBookmark(): void {
    this.post.isBookmarked = !this.post.isBookmarked;
    this.postService.bookmarkPost(this.post._id).subscribe({
      error: () => {
        this.post.isBookmarked = !this.post.isBookmarked;
      }
    });
  }

  onShare(): void {
    this.postService.sharePost(this.post._id).subscribe({
      next: () => {
        this.post.sharesCount = (this.post.sharesCount ?? 0) + 1;
      }
    });
  }

  startEdit(): void {
    this.editContent.set(this.post.body || '');
    this.isEditing.set(true);
    this.closeMenu();
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    const newBody = this.editContent().trim();
    if (!newBody) return;

    this.isUpdating.set(true);
    this.postService.updatePost(this.post._id, newBody).subscribe({
      next: (res) => {
        this.isUpdating.set(false);
        this.isEditing.set(false);
        if (res.data?.post) {
          this.post = res.data.post;
        } else {
          this.post.body = newBody;
        }
        this.postUpdated.emit(this.post);
      },
      error: () => {
        this.isUpdating.set(false);
      }
    });
  }

  openDeleteModal(): void {
    this.closeMenu();
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.postService.deletePost(this.post._id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.postDeleted.emit(this.post._id);
        if (this.isDetailView) {
          this.router.navigate(['/feed']);
        }
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }
}

