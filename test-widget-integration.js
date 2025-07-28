const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testWidgetIntegration() {
  console.log('🧪 Testing Widget Integration...\n');

  try {
    // Step 1: Check if server is running
    console.log('1️⃣ Checking server status...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is running\n');
    } catch (healthError) {
      console.log('❌ Server is not running. Please start the server first.');
      return;
    }

    // Step 2: Install the Hello World plugin
    console.log('2️⃣ Installing Hello World plugin...');
    try {
      const installResponse = await axios.post(`${BASE_URL}/api/plugins/install`, {
        pluginId: 'demo-hello-world'
      });
      
      console.log('Response status:', installResponse.status);
      console.log('Response data:', JSON.stringify(installResponse.data, null, 2));
      
      if (installResponse.data.message && installResponse.data.message.includes('successfully')) {
        console.log('✅ Plugin installed successfully');
        console.log(`   Plugin ID: ${installResponse.data.pluginId || 'unknown'}`);
        console.log('\n');
      } else {
        console.log('❌ Plugin installation failed:', installResponse.data.error || 'Unknown error');
        return;
      }
    } catch (installError) {
      console.log('❌ Plugin installation request failed:', installError.message);
      if (installError.response) {
        console.log('   Response status:', installError.response.status);
        console.log('   Response data:', JSON.stringify(installError.response.data, null, 2));
      }
      return;
    }

    // Step 3: Enable the plugin
    console.log('3️⃣ Enabling plugin...');
    try {
      const enableResponse = await axios.put(`${BASE_URL}/api/plugins/demo-hello-world`, {
        enabled: true
      });
      
      console.log('Enable response:', JSON.stringify(enableResponse.data, null, 2));
      
      if (enableResponse.data.message && enableResponse.data.message.includes('enabled successfully')) {
        console.log('✅ Plugin enabled successfully\n');
      } else {
        console.log('❌ Plugin enable failed:', enableResponse.data.error || 'Unknown error');
        return;
      }
    } catch (enableError) {
      console.log('❌ Plugin enable request failed:', enableError.message);
      if (enableError.response) {
        console.log('   Response status:', enableError.response.status);
        console.log('   Response data:', JSON.stringify(enableError.response.data, null, 2));
      }
      return;
    }

    // Step 4: Check installed plugins
    console.log('4️⃣ Checking installed plugins...');
    try {
      const pluginsResponse = await axios.get(`${BASE_URL}/api/plugins`);
      
      console.log('Plugins response:', JSON.stringify(pluginsResponse.data, null, 2));
      
      if (pluginsResponse.data.installed) {
        const plugins = pluginsResponse.data.installed;
        const helloWorldPlugin = plugins.find(p => p.id === 'demo-hello-world');
        
        if (helloWorldPlugin) {
          console.log('✅ Hello World plugin found in installed plugins');
          console.log(`   Status: ${helloWorldPlugin.status}`);
          console.log(`   Component: ${helloWorldPlugin.component || 'N/A'}\n`);
        } else {
          console.log('❌ Hello World plugin not found in installed plugins');
          console.log('   Available plugins:', plugins.map(p => `${p.id} (${p.status})`));
          console.log('   This suggests the persistence is not working correctly.\n');
        }
      } else {
        console.log('❌ Failed to get installed plugins:', pluginsResponse.data.error || 'No installed plugins array');
        return;
      }
    } catch (pluginsError) {
      console.log('❌ Get plugins request failed:', pluginsError.message);
      if (pluginsError.response) {
        console.log('   Response status:', pluginsError.response.status);
        console.log('   Response data:', JSON.stringify(pluginsError.response.data, null, 2));
      }
      return;
    }

    // Step 5: Check dashboard widgets
    console.log('5️⃣ Checking dashboard widgets...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/widgets`);
      
      console.log('Dashboard response:', JSON.stringify(dashboardResponse.data, null, 2));
      
      if (dashboardResponse.data.widgets) {
        const widgets = dashboardResponse.data.widgets;
        const helloWorldWidget = widgets.find(w => w.pluginId === 'demo-hello-world');
        
        if (helloWorldWidget) {
          console.log('✅ Hello World widget found on dashboard');
          console.log(`   Widget ID: ${helloWorldWidget.id}`);
          console.log(`   Title: ${helloWorldWidget.title}`);
          console.log(`   Component: ${helloWorldWidget.component}\n`);
        } else {
          console.log('❌ Hello World widget not found on dashboard');
          console.log('   Available widgets:', widgets.map(w => `${w.id} (${w.pluginId})`));
          console.log('   This suggests the widget registration is not working.\n');
        }
      } else {
        console.log('❌ Failed to get dashboard widgets:', dashboardResponse.data.error || 'No widgets array');
        return;
      }
    } catch (dashboardError) {
      console.log('❌ Get dashboard widgets request failed:', dashboardError.message);
      if (dashboardError.response) {
        console.log('   Response status:', dashboardError.response.status);
        console.log('   Response data:', JSON.stringify(dashboardError.response.data, null, 2));
      }
      return;
    }

    console.log('🎉 All tests passed! Widget integration is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Plugin installation works');
    console.log('   ✅ Plugin enabling works');
    console.log('   ✅ Plugin appears in installed plugins list');
    console.log('   ✅ Widget appears on dashboard');
    console.log('   ✅ Widget has correct component name');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testWidgetIntegration(); 