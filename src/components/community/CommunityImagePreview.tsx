import React, {useEffect, useState} from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {styles} from '../../styles';

type CommunityImagePreviewProps = {
  imageUrl: string;
  loading: boolean;
  onRemove: () => void;
};

export function CommunityImagePreview({
  imageUrl,
  loading,
  onRemove,
}: CommunityImagePreviewProps) {
  const trimmedUrl = imageUrl.trim();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => {
    setFailedUrl(null);
  }, [trimmedUrl]);

  if (!trimmedUrl) {
    return null;
  }

  const failed = failedUrl === trimmedUrl;

  return (
    <View style={styles.imagePreviewBox}>
      <View style={styles.imagePreviewHeader}>
        <Text style={styles.savedPlaceTitle}>사진 미리보기</Text>
        <Pressable
          style={({pressed}) => [
            styles.smallActionButton,
            styles.smallActionDangerButton,
            pressed ? styles.pressed : null,
            loading ? styles.disabled : null,
          ]}
          onPress={onRemove}
          disabled={loading}>
          <Text
            style={[
              styles.smallActionButtonText,
              styles.smallActionDangerButtonText,
            ]}>
            제거
          </Text>
        </Pressable>
      </View>
      {failed ? (
        <View style={styles.imageFallbackBox}>
          <Text style={styles.savedPlaceEmpty}>
            이미지를 불러올 수 없습니다. URL을 확인하거나 다른 사진을 선택해 주세요.
          </Text>
        </View>
      ) : (
        <Image
          source={{uri: trimmedUrl}}
          style={styles.postImage}
          resizeMode="cover"
          onError={() => setFailedUrl(trimmedUrl)}
        />
      )}
    </View>
  );
}
