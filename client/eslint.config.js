import pluginVue from 'eslint-plugin-vue';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
export default [
	...pluginVue.configs('flat/essential'),
	pluginPrettierRecommended,
	{
		files: ['**/*.vue', '**/*.js'],
	},
];
