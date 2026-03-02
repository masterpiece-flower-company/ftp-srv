import chmod from './chmod';

export interface SiteCommandDescriptor {
  handler: (ctx: any) => Promise<any>;
}

const registry: Record<string, SiteCommandDescriptor> = {
  CHMOD: { handler: chmod },
};

export default registry;
