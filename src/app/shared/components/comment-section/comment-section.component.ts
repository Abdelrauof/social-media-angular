import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostComment, CommentReply } from '../../../core/models/comment.model';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TimeAgoPipe],
  templateUrl: './comment-section.component.html'
})
export class CommentSectionComponent implements OnInit {
  @Input({ required: true }) postId!: string;

  commentService = inject(CommentService);
  authService = inject(AuthService);

  comments = signal<PostComment[]>([]);
  isLoading = signal(false);

  newCommentText = signal('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isSubmitting = signal(false);

  editingCommentId = signal<string | null>(null);
  editContent = signal('');

  activeReplyCommentId = signal<string | null>(null);
  replyText = signal('');
  repliesMap = signal<Record<string, CommentReply[]>>({});
  loadingRepliesMap = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading.set(true);
    this.commentService.getComments(this.postId).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.comments.set(res.data?.comments || []);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  isCommentOwner(comment: PostComment): boolean {
    const currentId = this.authService.currentUser()?._id;
    return !!(currentId && comment.commentCreator?._id && currentId === comment.commentCreator._id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  submitComment(): void {
    const text = this.newCommentText().trim();
    const file = this.selectedFile();

    if (!text && !file) return;

    this.isSubmitting.set(true);
    this.commentService.createComment(this.postId, text, file).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.newCommentText.set('');
        this.removeFile();
        if (res.data?.comment) {
          this.comments.update(list => [res.data.comment, ...list]);
        } else {
          this.loadComments();
        }
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  startEditComment(comment: PostComment): void {
    this.editingCommentId.set(comment._id);
    this.editContent.set(comment.content || '');
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
  }

  saveEditComment(comment: PostComment): void {
    const text = this.editContent().trim();
    if (!text) return;

    this.commentService.updateComment(this.postId, comment._id, text).subscribe({
      next: () => {
        comment.content = text;
        this.editingCommentId.set(null);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.deleteComment(this.postId, commentId).subscribe({
      next: () => {
        this.comments.update(list => list.filter(c => c._id !== commentId));
      }
    });
  }

  likeComment(comment: PostComment): void {
    const prevLiked = comment.isLiked;
    const prevCount = comment.likesCount ?? 0;
    comment.isLiked = !prevLiked;
    comment.likesCount = comment.isLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    this.commentService.likeComment(this.postId, comment._id).subscribe({
      error: () => {
        comment.isLiked = prevLiked;
        comment.likesCount = prevCount;
      }
    });
  }

  toggleReplies(commentId: string): void {
    const currentReplies = this.repliesMap()[commentId];
    if (currentReplies) {
      const nextMap = { ...this.repliesMap() };
      delete nextMap[commentId];
      this.repliesMap.set(nextMap);
      return;
    }

    this.loadingRepliesMap.update(m => ({ ...m, [commentId]: true }));
    this.commentService.getReplies(this.postId, commentId).subscribe({
      next: (res) => {
        this.loadingRepliesMap.update(m => ({ ...m, [commentId]: false }));
        this.repliesMap.update(m => ({ ...m, [commentId]: res.data?.replies || [] }));
      },
      error: () => {
        this.loadingRepliesMap.update(m => ({ ...m, [commentId]: false }));
      }
    });
  }

  openReplyInput(commentId: string): void {
    if (this.activeReplyCommentId() === commentId) {
      this.activeReplyCommentId.set(null);
    } else {
      this.activeReplyCommentId.set(commentId);
      this.replyText.set('');
    }
  }

  sendReply(commentId: string): void {
    const text = this.replyText().trim();
    if (!text) return;

    this.commentService.createReply(this.postId, commentId, text).subscribe({
      next: (res) => {
        this.replyText.set('');
        this.activeReplyCommentId.set(null);
        if (res.data?.reply) {
          const list = this.repliesMap()[commentId] || [];
          this.repliesMap.update(m => ({ ...m, [commentId]: [...list, res.data.reply] }));
        } else {
          this.toggleReplies(commentId);
        }
      }
    });
  }
}

