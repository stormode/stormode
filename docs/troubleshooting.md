# Troubleshooting

## ESModule & CommonJS

Most TypeScript templates use ESModule by default, and are subsequently transferred to CommonJS during transpilation. However, JavaScript templates employ CommonJS as the default, leading to an error `cannot use import statement outside a module` when attempting to use `import xx from xx` and `export default xx`. To resolve this error, you can add the following property to `package.json`:

```json
{
	"type": "module"
}
```
