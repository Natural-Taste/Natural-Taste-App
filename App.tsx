import React from 'react';
import {ScrollView, StatusBar, Text, View} from 'react-native';
import {AuthPanel} from './src/components/AuthPanel';
import {MessageBox} from './src/components/Common';
import {MapHome} from './src/components/MapHome';
import {useFoodMapApp} from './src/hooks/useFoodMapApp';
import {styles} from './src/styles';

function App() {
  const app = useFoodMapApp();

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={app.isDarkMode ? 'light-content' : 'dark-content'} />
      {app.auth ? (
        <MapHome {...app.mapHomeProps} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>FoodMap MVP</Text>
            <Text style={styles.title}>Natural Taste</Text>
            <Text style={styles.description}>
              맛집을 검색하고, 마음에 드는 장소를 내 목록에 저장하세요.
            </Text>
          </View>

          <MessageBox message={app.message} loading={app.loading} />
          <AuthPanel {...app.authPanelProps} />
        </ScrollView>
      )}
    </View>
  );
}

export default App;
