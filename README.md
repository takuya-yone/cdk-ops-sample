# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `pnpm build` compile typescript to js
- `pnpm watch` watch for changes and compile
- `pnpm test` perform the jest unit tests
- `pnpm cdk deploy` deploy this stack to your default AWS account/region
- `pnpm cdk diff` compare deployed stack with current state
- `pnpm cdk synth` emits the synthesized CloudFormation template

## How to synth

```bash
pnpm ecr:login
pnpm cdk synth
```

## How to deploy

```bash
pnpm ecr:login
pnpm cdk deploy
```

## cfn-guard

#### rulegen

```bash
cfn-guard rulegen --template cfn-guard/rules/bucket-versioning/template.yml --output cfn-guard/rules/bucket-versioning/bucket-versioning.guard
cfn-guard rulegen --template cfn-guard/rules/vpc-enable-dns/template.yml --output cfn-guard/rules/vpc-enable-dns/vpc-enable-dns.guard
```

#### validate synth result

```bash
pnpm ecr:login
npx cdk synth | cfn-guard validate --rules cfn-guard/rules
```

## Memo

#### `TypeError: Cannot redefine property`

https://zenn.dev/karamem0/articles/2021_10_04_120000
