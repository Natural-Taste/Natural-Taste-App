import {useState} from 'react';
import {request, getErrorMessage} from '../api/client';
import type {AuthResponse, CommunityComment, CommunityPost, Message, Restaurant} from '../types';
import {getRestaurantKey, toSaveRestaurantBody} from '../utils/restaurants';

type UseCommunityFeatureParams = {
  auth: AuthResponse | null;
  setLoading: (loading: boolean) => void;
  setMessage: (message: Message) => void;
  setSelectedRestaurant: React.Dispatch<React.SetStateAction<Restaurant | null>>;
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  setSavedRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
};

export function useCommunityFeature({
  auth,
  setLoading,
  setMessage,
  setSelectedRestaurant,
  setRestaurants,
  setSavedRestaurants,
}: UseCommunityFeatureParams) {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [selectedCommunityPost, setSelectedCommunityPost] = useState<CommunityPost | null>(null);
  const [postWriting, setPostWriting] = useState(false);
  const [postDraftRestaurant, setPostDraftRestaurant] = useState<Restaurant | null>(null);
  const [postPlaceQuery, setPostPlaceQuery] = useState('');
  const [postPlaceResults, setPostPlaceResults] = useState<Restaurant[]>([]);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [communityComments, setCommunityComments] = useState<CommunityComment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [postEditing, setPostEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const resetCommunityState = () => {
    setCommunityPosts([]);
    setSelectedCommunityPost(null);
    setPostWriting(false);
    setPostEditing(false);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
    setCommunityComments([]);
    setCommentContent('');
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const resetCommunitySelection = () => {
    setSelectedCommunityPost(null);
    setPostWriting(false);
    setPostEditing(false);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setCommunityComments([]);
    setCommentContent('');
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const loadCommunityPosts = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const data = await request<CommunityPost[]>('/community/posts', {auth});
      setCommunityPosts(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? '커뮤니티 게시글을 불러왔습니다.'
            : '아직 커뮤니티 게시글이 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '커뮤니티 조회에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityComments = async (postId: number) => {
    if (!auth) {
      return;
    }

    try {
      const data = await request<CommunityComment[]>(
        `/community/posts/${postId}/comments`,
        {auth},
      );
      setCommunityComments(data);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '댓글 조회에 실패했습니다.'),
      });
    }
  };

  const selectCommunityPost = async (post: CommunityPost | null) => {
    setSelectedCommunityPost(post);
    setPostWriting(false);
    setPostEditing(false);
    setPostDraftRestaurant(null);
    setCommentContent('');
    setEditingCommentId(null);
    setEditingCommentContent('');

    if (post) {
      await loadCommunityComments(post.id);
      return;
    }

    setCommunityComments([]);
  };

  const startCommunityPost = () => {
    setSelectedCommunityPost(null);
    setPostWriting(true);
    setPostEditing(false);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
    setCommunityComments([]);
    setCommentContent('');
  };

  const cancelCommunityPost = () => {
    setPostWriting(false);
    setPostEditing(false);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
  };

  const searchCommunityPostPlaces = async () => {
    if (!auth || !postPlaceQuery.trim()) {
      setMessage({tone: 'error', text: '장소 검색어를 입력해 주세요.'});
      return;
    }

    setLoading(true);
    setMessage({tone: 'info', text: '후기를 남길 장소를 검색하는 중입니다.'});

    try {
      const data = await request<Restaurant[]>(
        `/restaurants/search?query=${encodeURIComponent(postPlaceQuery.trim())}`,
        {auth},
      );
      setPostPlaceResults(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? `${data.length}개의 장소를 찾았습니다.`
            : '장소 검색 결과가 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '장소 검색에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const selectCommunityPostPlace = (restaurant: Restaurant) => {
    setPostDraftRestaurant(restaurant);
    setPostPlaceResults([]);
    setPostPlaceQuery(restaurant.name);
    setMessage({tone: 'success', text: '장소를 선택했습니다.'});
  };

  const createCommunityPost = async () => {
    if (!auth || !postDraftRestaurant) {
      setMessage({tone: 'error', text: '후기를 남길 장소를 선택해 주세요.'});
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      setMessage({tone: 'error', text: '제목과 내용을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const created = await request<CommunityPost>('/community/posts', {
        method: 'POST',
        auth,
        body: {
          title: postTitle.trim(),
          content: postContent.trim(),
          imageUrl: postImageUrl.trim() || undefined,
          restaurant: toSaveRestaurantBody(postDraftRestaurant),
        },
      });
      setCommunityPosts(current => [
        created,
        ...current.filter(post => post.id !== created.id),
      ]);
      setSelectedCommunityPost(created);
      setPostWriting(false);
      setPostEditing(false);
      setPostDraftRestaurant(null);
      setPostPlaceQuery('');
      setPostPlaceResults([]);
      setPostTitle('');
      setPostContent('');
      setPostImageUrl('');
      setCommunityComments([]);
      setCommentContent('');
      setSelectedRestaurant(null);
      setMessage({tone: 'success', text: '커뮤니티 게시글을 작성했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '게시글 작성에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditCommunityPost = (post: CommunityPost) => {
    setPostEditing(true);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostImageUrl(post.imageUrl ?? '');
  };

  const cancelEditCommunityPost = () => {
    setPostEditing(false);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
  };

  const updateCommunityPost = async () => {
    if (!auth || !selectedCommunityPost) {
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      setMessage({tone: 'error', text: '제목과 내용을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const updated = await request<CommunityPost>(
        `/community/posts/${selectedCommunityPost.id}`,
        {
          method: 'PATCH',
          auth,
          body: {
            title: postTitle.trim(),
            content: postContent.trim(),
            imageUrl: postImageUrl.trim() || null,
          },
        },
      );
      setCommunityPosts(current =>
        current.map(post => (post.id === updated.id ? updated : post)),
      );
      setSelectedCommunityPost(updated);
      setPostEditing(false);
      setPostTitle('');
      setPostContent('');
      setPostImageUrl('');
      setMessage({tone: 'success', text: '게시글을 수정했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '게시글 수정에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCommunityRestaurant = async (post: CommunityPost) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const saved = await request<Restaurant>(
        `/community/posts/${post.id}/save`,
        {
          method: 'POST',
          auth,
        },
      );
      setSavedRestaurants(current => [
        saved,
        ...current.filter(item => getRestaurantKey(item) !== getRestaurantKey(saved)),
      ]);
      setRestaurants(current =>
        current.map(item =>
          getRestaurantKey(item) === getRestaurantKey(saved)
            ? {...item, id: saved.id, saved: true}
            : item,
        ),
      );
      setCommunityPosts(current =>
        current.map(item =>
          item.id === post.id
            ? {...item, restaurant: {...item.restaurant, id: saved.id, saved: true}}
            : item,
        ),
      );
      setSelectedCommunityPost(current =>
        current?.id === post.id
          ? {...current, restaurant: {...current.restaurant, id: saved.id, saved: true}}
          : current,
      );
      setMessage({tone: 'success', text: '게시글의 맛집을 저장했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '게시글 맛집 저장에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCommunityRecommendation = async (post: CommunityPost) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const updated = await request<CommunityPost>(
        `/community/posts/${post.id}/recommend`,
        {
          method: 'POST',
          auth,
        },
      );
      setCommunityPosts(current =>
        current.map(item => (item.id === updated.id ? updated : item)),
      );
      setSelectedCommunityPost(current =>
        current?.id === updated.id ? updated : current,
      );
      setMessage({
        tone: 'success',
        text: updated.recommended ? '게시글을 추천했습니다.' : '추천을 취소했습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '추천 상태 변경에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const createCommunityComment = async () => {
    if (!auth || !selectedCommunityPost) {
      return;
    }

    if (!commentContent.trim()) {
      setMessage({tone: 'error', text: '댓글 내용을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const created = await request<CommunityComment>(
        `/community/posts/${selectedCommunityPost.id}/comments`,
        {
          method: 'POST',
          auth,
          body: {content: commentContent.trim()},
        },
      );
      setCommunityComments(current => [...current, created]);
      setCommunityPosts(current =>
        current.map(post =>
          post.id === selectedCommunityPost.id
            ? {...post, commentCount: post.commentCount + 1}
            : post,
        ),
      );
      setSelectedCommunityPost(current =>
        current ? {...current, commentCount: current.commentCount + 1} : current,
      );
      setCommentContent('');
      setMessage({tone: 'success', text: '댓글을 작성했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '댓글 작성에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunityPost = async (post: CommunityPost) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      await request(`/community/posts/${post.id}`, {
        method: 'DELETE',
        auth,
      });
      setCommunityPosts(current => current.filter(item => item.id !== post.id));
      setSelectedCommunityPost(null);
      setCommunityComments([]);
      setCommentContent('');
      setPostEditing(false);
      setEditingCommentId(null);
      setEditingCommentContent('');
      setMessage({tone: 'success', text: '게시글을 삭제했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '게시글 삭제에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditCommunityComment = (comment: CommunityComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const cancelEditCommunityComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const updateCommunityComment = async (comment: CommunityComment) => {
    if (!auth || !selectedCommunityPost) {
      return;
    }

    if (!editingCommentContent.trim()) {
      setMessage({tone: 'error', text: '댓글 내용을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const updated = await request<CommunityComment>(
        `/community/posts/${selectedCommunityPost.id}/comments/${comment.id}`,
        {
          method: 'PATCH',
          auth,
          body: {content: editingCommentContent.trim()},
        },
      );
      setCommunityComments(current =>
        current.map(item => (item.id === updated.id ? updated : item)),
      );
      setEditingCommentId(null);
      setEditingCommentContent('');
      setMessage({tone: 'success', text: '댓글을 수정했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '댓글 수정에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunityComment = async (comment: CommunityComment) => {
    if (!auth || !selectedCommunityPost) {
      return;
    }

    setLoading(true);
    try {
      await request(
        `/community/posts/${selectedCommunityPost.id}/comments/${comment.id}`,
        {
          method: 'DELETE',
          auth,
        },
      );
      setCommunityComments(current => current.filter(item => item.id !== comment.id));
      setCommunityPosts(current =>
        current.map(post =>
          post.id === selectedCommunityPost.id
            ? {...post, commentCount: Math.max(post.commentCount - 1, 0)}
            : post,
        ),
      );
      setSelectedCommunityPost(current =>
        current
          ? {...current, commentCount: Math.max(current.commentCount - 1, 0)}
          : current,
      );
      if (editingCommentId === comment.id) {
        setEditingCommentId(null);
        setEditingCommentContent('');
      }
      setMessage({tone: 'success', text: '댓글을 삭제했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '댓글 삭제에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    communityPosts,
    selectedCommunityPost,
    postWriting,
    postEditing,
    postDraftRestaurant,
    postPlaceQuery,
    postPlaceResults,
    postTitle,
    postContent,
    postImageUrl,
    communityComments,
    commentContent,
    editingCommentId,
    editingCommentContent,
    setSelectedCommunityPost,
    setPostWriting,
    setPostDraftRestaurant,
    setPostPlaceQuery,
    setPostPlaceResults,
    setPostTitle,
    setPostContent,
    setPostImageUrl,
    setCommunityComments,
    setCommentContent,
    setEditingCommentContent,
    resetCommunityState,
    resetCommunitySelection,
    loadCommunityPosts,
    selectCommunityPost,
    startCommunityPost,
    cancelCommunityPost,
    searchCommunityPostPlaces,
    selectCommunityPostPlace,
    createCommunityPost,
    startEditCommunityPost,
    cancelEditCommunityPost,
    updateCommunityPost,
    saveCommunityRestaurant,
    toggleCommunityRecommendation,
    createCommunityComment,
    startEditCommunityComment,
    cancelEditCommunityComment,
    updateCommunityComment,
    deleteCommunityPost,
    deleteCommunityComment,
  };
}
